import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/Button";

type Status = { configured: boolean; connected: boolean; redirectUri: string; origin: string };
type PickedItem = { id: string; kind: "photo" | "video"; filename: string; alreadyAdded: boolean; ready: boolean };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

/**
 * "Add from Google Photos": opens Google's own photo picker in a popup, waits
 * until you've picked, then copies the photos into R2 and adds them to Memories.
 */
export function GooglePhotosImport({ onImported }: { onImported: () => Promise<void> | void }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [phase, setPhase] = useState<"idle" | "picking" | "importing">("idle");
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [counts, setCounts] = useState({ added: 0, skipped: 0 });
  const [pickerLink, setPickerLink] = useState<string | null>(null);
  const [remainingMs, setRemainingMs] = useState<number | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number; current: string } | null>(null);
  const cancelled = useRef(false);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await json<Status>(await fetch("/api/google-photos/status", { cache: "no-store" })));
    } catch {
      setStatus(null);
    }
  }, []);

  useEffect(() => {
    loadStatus();
    // Result of the Google sign-in redirect (?google=connected|error&message=…)
    const params = new URLSearchParams(window.location.search);
    const result = params.get("google");
    if (result === "connected") setMessage({ kind: "ok", text: "Google Photos connected. You can now pick photos." });
    if (result === "error") setMessage({ kind: "error", text: params.get("message") || "Couldn't connect Google Photos." });
    if (result) window.history.replaceState(null, "", "/admin?tab=memories");
  }, [loadStatus]);

  /** Retries a request a few times with growing pauses, so one network blip doesn't stop everything. */
  const withRetry = async <T,>(fn: () => Promise<T>, tries = 4): Promise<T> => {
    let lastError: unknown;
    for (let attempt = 0; attempt < tries; attempt++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        await sleep(Math.min(15000, 1500 * 2 ** attempt));
      }
    }
    throw lastError;
  };

  const pick = async () => {
    setMessage(null);
    setCounts({ added: 0, skipped: 0 });
    setRemainingMs(null);
    cancelled.current = false;
    // Open the window right away (inside the click) so the browser doesn't block it.
    const popup = window.open("about:blank", "google-photos-picker", "width=1200,height=820");

    try {
      setPhase("picking");
      const session = await withRetry(async () =>
        json<{ id: string; pickerUri: string }>(await fetch("/api/google-photos/session", { method: "POST" }))
      );
      const link = `${session.pickerUri}/autoclose`;
      setPickerLink(link);
      if (popup && !popup.closed) popup.location.href = link;

      // Wait until Google says the photos are picked. Note: we can't watch the
      // popup itself; once it's on photos.google.com the browser reports it as
      // "closed" for security reasons, even while you're still choosing.
      let done = false;
      let failuresInARow = 0;
      while (!cancelled.current) {
        try {
          const st = await json<{ done: boolean; pollMs: number; remainingMs: number }>(
            await fetch(`/api/google-photos/session?id=${encodeURIComponent(session.id)}`, { cache: "no-store" })
          );
          failuresInARow = 0;
          if (st.done) {
            done = true;
            break;
          }
          if (st.remainingMs <= 0) break; // Google's 30-minute picker window ran out
          setRemainingMs(st.remainingMs);
          await sleep(st.pollMs);
        } catch {
          // Temporary problem (network, Google busy): wait longer and keep going.
          failuresInARow++;
          if (failuresInARow >= 10) throw new Error("Lost contact with Google Photos. Please try again.");
          await sleep(Math.min(30000, 2000 * failuresInARow));
        }
      }
      setPickerLink(null);
      setRemainingMs(null);

      if (cancelled.current) {
        setMessage({ kind: "error", text: "Cancelled. Nothing was added." });
        return;
      }
      if (!done) {
        setMessage({ kind: "error", text: "The Google Photos picker timed out (30 minutes). Click “Choose photos” to start again." });
        return;
      }

      // 1) List everything that was picked.
      setPhase("importing");
      const picked: PickedItem[] = [];
      let pageToken: string | null = null;
      do {
        const token: string | null = pageToken;
        const page: { items: PickedItem[]; nextPageToken: string | null } = await withRetry(async () =>
          json(
            await fetch("/api/google-photos/import", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sessionId: session.id, pageToken: token }),
            })
          )
        );
        picked.push(...page.items);
        pageToken = page.nextPageToken;
      } while (pageToken);

      // 2) Copy each photo/video in its own request (two at a time), so one big
      //    video can't hold up or time out the rest.
      const total = picked.length;
      let added = 0;
      let addedVideos = 0;
      let doneCount = 0;
      const skipped: string[] = [];
      const failures: string[] = [];
      setProgress({ done: 0, total, current: "" });
      let next = 0;
      const worker = async () => {
        while (next < picked.length) {
          const item = picked[next++];
          setProgress((p) => (p ? { ...p, current: item.kind === "video" ? `video: ${item.filename}` : item.filename } : p));
          try {
            const r: { added?: boolean; skipped?: string } = await withRetry(
              async () =>
                json(
                  await fetch("/api/google-photos/import-item", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item }),
                  })
                ),
              item.kind === "video" ? 2 : 3
            );
            if (r.added) {
              added++;
              if (item.kind === "video") addedVideos++;
            } else if (r.skipped) skipped.push(`${item.filename} (${r.skipped})`);
          } catch (err: any) {
            failures.push(`${item.filename}: ${err.message}`);
          }
          doneCount++;
          setProgress((p) => (p ? { ...p, done: doneCount } : p));
          setCounts({ added, skipped: skipped.length });
          if (doneCount % 4 === 0) await onImported();
        }
      };
      await Promise.all([worker(), worker()]);
      await fetch("/api/google-photos/finish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: session.id }),
      }).catch(() => {});
      await onImported();

      const videoNote = addedVideos ? ` (${addedVideos} video${addedVideos === 1 ? "" : "s"})` : "";
      setMessage({
        kind: failures.length ? "error" : "ok",
        text:
          `Added ${added} item${added === 1 ? "" : "s"}${videoNote} from Google Photos.` +
          (skipped.length ? ` Skipped ${skipped.length}: ${skipped.slice(0, 2).join(", ")}${skipped.length > 2 ? "…" : ""}.` : "") +
          (failures.length ? ` ${failures.length} failed — ${failures[0]}` : ""),
      });
    } catch (err: any) {
      setMessage({ kind: "error", text: err.message });
      await loadStatus();
    } finally {
      setPhase("idle");
      setPickerLink(null);
      setRemainingMs(null);
      setProgress(null);
    }
  };

  const disconnect = async () => {
    if (!confirm("Disconnect Google Photos? Photos you already added stay.")) return;
    await fetch("/api/google-photos/disconnect", { method: "POST" });
    await loadStatus();
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-background p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Google Photos pinwheel */}
          <svg viewBox="0 0 24 24" className="size-8 shrink-0" aria-hidden="true">
            <path fill="#EA4335" d="M12 2a5 5 0 0 1 5 5v5H12z" />
            <path fill="#FBBC04" d="M22 12a5 5 0 0 1-5 5h-5v-5z" />
            <path fill="#34A853" d="M12 22a5 5 0 0 1-5-5v-5h5z" />
            <path fill="#4285F4" d="M2 12a5 5 0 0 1 5-5h5v5z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-foreground">Add from Google Photos</p>
            <p className="text-xs text-on-surface-variant">
              {!status
                ? "Checking…"
                : !status.configured
                  ? "One-time setup needed (steps below)."
                  : status.connected
                    ? "Connected. Pick photos and videos in Google's own picker; they're copied into your storage."
                    : "Sign in with Google once to allow picking photos."}
            </p>
          </div>
        </div>

        {status?.configured && !status.connected && (
          <a
            href="/api/google-photos/connect"
            className="inline-flex h-9 items-center justify-center rounded-lg bg-foreground px-4 text-xs font-medium text-background transition-colors hover:bg-foreground/90"
          >
            Connect Google Photos
          </a>
        )}
        {status?.connected && (
          <div className="flex items-center gap-3">
            <button type="button" onClick={disconnect} className="text-xs text-on-surface-variant hover:text-destructive cursor-pointer">
              Disconnect
            </button>
            {phase === "picking" ? (
              <Button
                variant="outline"
                onClick={() => {
                  cancelled.current = true;
                }}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
            ) : (
              <Button variant="primary" onClick={pick} disabled={phase !== "idle"} className="h-9 text-xs">
                {phase === "importing" ? `Importing… ${counts.added} added` : "Choose photos & videos"}
              </Button>
            )}
          </div>
        )}
      </div>

      {phase === "picking" && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
          <span className="material-symbols-outlined animate-spin text-[16px] text-primary">progress_activity</span>
          <span className="text-foreground">
            Take your time choosing in the Google Photos window, then click <strong>Done</strong> there.
            {remainingMs !== null && (
              <span className="text-on-surface-variant"> ({Math.max(1, Math.round(remainingMs / 60000))} min left)</span>
            )}
          </span>
          {pickerLink && (
            <button
              type="button"
              onClick={() => window.open(pickerLink, "google-photos-picker", "width=1200,height=820")}
              className="ml-auto font-medium text-primary underline cursor-pointer"
            >
              Reopen picker
            </button>
          )}
        </div>
      )}

      {phase === "importing" && progress && progress.total > 0 && (
        <div className="space-y-1.5 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
          <div className="flex items-center justify-between gap-3">
            <span className="text-foreground">
              Copying {progress.done} of {progress.total}
              {progress.current && <span className="text-on-surface-variant"> · {progress.current}</span>}
            </span>
            <span className="text-on-surface-variant">Videos can take a minute each</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(progress.done / progress.total) * 100}%` }} />
          </div>
        </div>
      )}

      {message && (
        <p
          className={`rounded-lg border px-3 py-2 text-xs ${
            message.kind === "ok" ? "border-success/30 bg-success/10 text-success" : "border-destructive/30 bg-destructive/10 text-destructive"
          }`}
        >
          {message.text}
        </p>
      )}

      {status && !status.configured && (
        <details className="text-xs text-on-surface-variant">
          <summary className="cursor-pointer font-medium text-foreground">Setup steps (about 5 minutes, once)</summary>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5">
            <li>
              Open <a className="text-primary underline" href="https://console.cloud.google.com/projectcreate" target="_blank" rel="noopener noreferrer">Google Cloud Console</a> and create a project.
            </li>
            <li>
              In <em>APIs &amp; Services → Library</em>, enable <strong>Google Photos Picker API</strong> (not &ldquo;Google Picker API&rdquo;).
            </li>
            <li>
              In <em>OAuth consent screen</em>: choose <em>External</em>, fill in the app name and your email, and add yourself under <em>Test users</em>.
            </li>
            <li>
              In <em>Credentials → Create credentials → OAuth client ID</em>: type <em>Web application</em>, and add this
              under <em>Authorized redirect URIs</em>:
              <code className="mt-1 block break-all rounded bg-muted px-2 py-1 font-mono text-[11px] text-foreground">{status.redirectUri}</code>
              (add your live site&apos;s version too, e.g. <code>https://gauravsunthwal.vercel.app/api/google-photos/callback</code>).
            </li>
            <li>
              Put the Client ID and secret in <code>.env.local</code> (and in Vercel) as <code>GOOGLE_CLIENT_ID</code> and{" "}
              <code>GOOGLE_CLIENT_SECRET</code>, then restart the site.
            </li>
          </ol>
        </details>
      )}
    </div>
  );
}
