import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { importFromUrlDetailed, uploadFile } from "@/lib/upload-client";
import { formatDuration, isVideoFile, isVideoUrl, readVideo } from "@/lib/video-client";
import { useImageCrop, ASPECTS } from "@/app/admin/components/ImageCropper";
import { GooglePhotosImport } from "@/app/admin/components/GooglePhotosImport";

type Memory = {
  id: number;
  url: string;
  caption: string;
  takenOn: string;
  width: number;
  height: number;
  position: number;
  deletedAt?: string | null;
  source?: string;
  kind?: string;
  poster?: string | null;
  duration?: number;
};

type NewItem = { url: string; kind: "photo" | "video"; width: number; height: number; poster?: string | null; duration?: number };

const CROP = {
  aspects: [ASPECTS.original, ASPECTS.portrait, ASPECTS.square, ASPECTS.classic, ASPECTS.wide, ASPECTS.video],
  title: "Crop memory",
};

/** Reads an image's real size so the public grid can reserve the right space. */
async function measure(url: string) {
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    return { width: img.naturalWidth, height: img.naturalHeight };
  } catch {
    return { width: 0, height: 0 };
  }
}

async function api(path: string, init?: RequestInit) {
  const res = await fetch(path, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

const post = (path: string, body: unknown) =>
  api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export function MemoriesTab() {
  const [items, setItems] = useState<Memory[]>([]);
  const [trash, setTrash] = useState<Memory[]>([]);
  const [showTrash, setShowTrash] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [cropEach, setCropEach] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [dragId, setDragId] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [isDropping, setIsDropping] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [copyLinks, setCopyLinks] = useState(true);
  const [linkErrors, setLinkErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { cropper, cropAndUpload, cropExisting } = useImageCrop();

  const load = useCallback(async () => {
    try {
      const [list, bin] = await Promise.all([
        api("/api/memories", { cache: "no-store" }),
        api("/api/memories?trash=1", { cache: "no-store" }),
      ]);
      setItems(list);
      setTrash(bin);
    } catch (err: any) {
      alert("Couldn't load memories: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Uploads a video and its cover frame; returns the memory to save. */
  const prepareVideo = async (file: File): Promise<NewItem> => {
    const local = URL.createObjectURL(file);
    const info = await readVideo(local);
    URL.revokeObjectURL(local);
    const url = await uploadFile(file, { category: "memories" });
    const poster = info.poster
      ? await uploadFile(new File([info.poster], file.name.replace(/\.[^.]+$/, "") + "-cover.jpg", { type: "image/jpeg" }), {
          category: "memories",
        })
      : null;
    return { url, kind: "video", poster, width: info.width, height: info.height, duration: info.duration };
  };

  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/") || isVideoFile(f));
    if (files.length === 0) return;
    setProgress({ done: 0, total: files.length });

    // Results are saved together at the end so they keep the order you picked them in.
    const results: (NewItem | null)[] = new Array(files.length).fill(null);
    const tick = () => setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));

    try {
      if (cropEach) {
        // One at a time, so each photo gets its own crop window (videos aren't cropped).
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            if (isVideoFile(file)) results[i] = await prepareVideo(file);
            else {
              const [url] = await cropAndUpload([file], CROP);
              if (url) results[i] = { url, kind: "photo", ...(await measure(url)) };
            }
          } catch (err: any) {
            alert(`Couldn't upload ${file.name}: ${err.message}`);
          }
          tick();
        }
      } else {
        // Three uploads at a time keeps big batches quick.
        let next = 0;
        const worker = async () => {
          while (next < files.length) {
            const index = next++;
            const file = files[index];
            try {
              if (isVideoFile(file)) results[index] = await prepareVideo(file);
              else {
                const url = await uploadFile(file, { category: "memories" });
                results[index] = { url, kind: "photo", ...(await measure(url)) };
              }
            } catch (err: any) {
              alert(`Couldn't upload ${file.name}: ${err.message}`);
            }
            tick();
          }
        };
        await Promise.all([worker(), worker(), worker()]);
      }
      const uploaded = results.filter(Boolean);
      if (uploaded.length) await post("/api/memories", { items: uploaded });
    } finally {
      setProgress(null);
      await load();
    }
  };

  /** Adds photos from pasted links, keeping the order they were pasted in. */
  const addLinks = async () => {
    const links = linkText
      .split(/[\s,]+/)
      .map((l) => l.trim())
      .filter((l) => /^https?:\/\//i.test(l));
    if (links.length === 0) {
      setLinkErrors(["Paste at least one link starting with http:// or https://"]);
      return;
    }
    setLinkErrors([]);
    setProgress({ done: 0, total: links.length });
    const results: (NewItem | null)[] = new Array(links.length).fill(null);
    const errors: string[] = [];
    let next = 0;
    const worker = async () => {
      while (next < links.length) {
        const index = next++;
        const link = links[index];
        try {
          // Copying into our storage means the memory survives if the other site deletes it.
          let url = link;
          let kind: "photo" | "video" = isVideoUrl(link) ? "video" : "photo";
          if (copyLinks) {
            const r = await importFromUrlDetailed(link, "memories");
            url = r.url;
            kind = r.kind;
          }
          if (kind === "video") {
            const info = await readVideo(url);
            if (!info.width) throw new Error("couldn't play this video link");
            const poster = info.poster
              ? await uploadFile(new File([info.poster], "video-cover.jpg", { type: "image/jpeg" }), { category: "memories" })
              : null;
            results[index] = { url, kind, poster, width: info.width, height: info.height, duration: info.duration };
          } else {
            const size = await measure(url);
            if (!copyLinks && !size.width) throw new Error("couldn't load an image from this link");
            results[index] = { url, kind, ...size };
          }
        } catch (err: any) {
          errors.push(`${link.length > 60 ? link.slice(0, 60) + "…" : link} — ${err.message}`);
        }
        setProgress((p) => (p ? { ...p, done: p.done + 1 } : p));
      }
    };
    try {
      await Promise.all([worker(), worker(), worker()]);
      const added = results.filter(Boolean);
      if (added.length) await post("/api/memories", { items: added });
      setLinkErrors(errors);
      // Keep only the links that failed in the box, so they can be fixed and retried.
      setLinkText(links.filter((_, i) => !results[i]).join("\n"));
    } finally {
      setProgress(null);
      await load();
    }
  };

  const update = async (id: number, fields: Partial<Memory>) => {
    setItems((list) => list.map((m) => (m.id === id ? { ...m, ...fields } : m)));
    try {
      await post("/api/memories", { id, ...fields });
    } catch (err: any) {
      alert("Couldn't save: " + err.message);
    }
  };

  const reorder = async (list: Memory[]) => {
    setItems(list);
    await post("/api/memories/reorder", { ids: list.map((m) => m.id) }).catch((err) => alert(err.message));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const list = [...items];
    const [m] = list.splice(from, 1);
    list.splice(to, 0, m);
    reorder(list);
  };

  // Deleting moves photos to "Recently deleted"; nothing is lost until it's emptied there.
  const remove = async (ids: number[]) => {
    if (ids.length > 1 && !confirm(`Move ${ids.length} photos to Recently deleted? You can restore them from there.`)) return;
    setItems((list) => list.filter((m) => !ids.includes(m.id)));
    setSelected(new Set());
    await Promise.all(ids.map((id) => api(`/api/memories/${id}`, { method: "DELETE" }).catch(() => {})));
    await load();
  };

  const restore = async (ids: number[]) => {
    for (const id of ids) await post("/api/memories", { id, restore: true }).catch((err) => alert(err.message));
    await load();
  };

  const deleteForever = async (ids: number[]) => {
    if (!confirm(`Permanently delete ${ids.length} photo${ids.length === 1 ? "" : "s"}? The files are removed from storage and can't be recovered.`)) return;
    await Promise.all(ids.map((id) => api(`/api/memories/${id}?forever=1`, { method: "DELETE" }).catch(() => {})));
    await load();
  };

  const recrop = async (m: Memory) => {
    setBusyId(m.id);
    const url = await cropExisting(m.url, { ...CROP, category: "memories" });
    if (url) await update(m.id, { url, ...(await measure(url)) });
    setBusyId(null);
  };

  const toggle = (id: number) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const iconBtn =
    "flex size-7 items-center justify-center rounded-md border border-border bg-background text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

  return (
    <div className="space-y-6 pb-16">
      {cropper}

      <Card interactive={false} className="p-6 md:p-8 space-y-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-title-md text-title-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">photo_library</span>
              Memories page
            </h3>
            <p className="text-xs text-on-surface-variant max-w-2xl">
              Every photo here appears on the Pinterest-style <code>/memories</code> page, in this order. Photos keep their
              own shape. Give a photo a <strong>place / date</strong> (e.g. &ldquo;Manali&rdquo; or &ldquo;Dec 2025&rdquo;)
              and visitors can filter by it. Changes save instantly.
            </p>
          </div>
          <Button variant="outline" href="/memories" target="_blank" className="h-9 text-xs shrink-0">
            View page ↗
          </Button>
        </div>

        <div
          onDragOver={(e) => {
            if (e.dataTransfer.types.includes("Files")) {
              e.preventDefault();
              setIsDropping(true);
            }
          }}
          onDragLeave={() => setIsDropping(false)}
          onDrop={(e) => {
            if (!e.dataTransfer.files.length) return;
            e.preventDefault();
            setIsDropping(false);
            addFiles(e.dataTransfer.files);
          }}
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
            isDropping ? "border-primary bg-primary/5" : "border-border bg-surface-container-low/40"
          }`}
        >
          <span className={`material-symbols-outlined text-3xl text-primary ${progress ? "animate-spin" : ""}`}>
            {progress ? "progress_activity" : "add_photo_alternate"}
          </span>
          {progress ? (
            <p className="text-sm font-medium">
              Uploading {progress.done} of {progress.total}…
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">Drop photos or videos here</p>
              <Button variant="primary" onClick={() => inputRef.current?.click()} className="h-9 text-xs">
                Choose files
              </Button>
              <p className="text-[11px] text-on-surface-variant">Videos up to 1 GB · a cover frame is captured automatically</p>
            </>
          )}
          <label className="mt-1 flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
            <input type="checkbox" checked={cropEach} onChange={(e) => setCropEach(e.target.checked)} className="accent-[var(--brand)]" />
            Crop each photo before uploading
          </label>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        <GooglePhotosImport onImported={load} />

        {/* Add by link */}
        <div className="space-y-2">
          <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Or add from links (one per line, photos or .mp4 videos)
          </label>
          <textarea
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            rows={3}
            placeholder={"https://example.com/photo-1.jpg\nhttps://example.com/photo-2.png"}
            className="w-full p-3 bg-background border border-border rounded-lg font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand/60 focus:ring-2 focus:ring-brand/20 resize-y"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-xs text-on-surface-variant cursor-pointer select-none">
              <input type="checkbox" checked={copyLinks} onChange={(e) => setCopyLinks(e.target.checked)} className="accent-[var(--brand)]" />
              Save a copy to my storage (recommended — keeps working if the other site removes the image)
            </label>
            <Button variant="primary" onClick={addLinks} disabled={!linkText.trim() || progress !== null} className="h-9 text-xs">
              {progress ? `Adding ${progress.done} of ${progress.total}…` : "Add from links"}
            </Button>
          </div>
          <p className="text-[11px] text-on-surface-variant">
            Use the image&apos;s own address: right-click a photo → &ldquo;Copy image address&rdquo;. Links to a web page (like a
            Google Photos album) won&apos;t work.
          </p>
          {linkErrors.length > 0 && (
            <ul className="space-y-1 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {linkErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-on-surface-variant">
          {items.length} photo{items.length === 1 ? "" : "s"} · drag to reorder
        </span>
        {items.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSelected(selected.size === items.length ? new Set() : new Set(items.map((m) => m.id)))}
              className="text-xs font-medium text-primary hover:underline cursor-pointer"
            >
              {selected.size === items.length ? "Clear selection" : "Select all"}
            </button>
            {selected.size > 0 && (
              <Button variant="outline" onClick={() => remove([...selected])} className="h-8 text-xs !text-red-600">
                Move {selected.size} to Recently deleted
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Recently deleted */}
      {trash.length > 0 && (
        <div className="rounded-xl border border-border bg-background">
          <button
            type="button"
            onClick={() => setShowTrash((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
          >
            <span className="flex items-center gap-2 text-sm font-medium">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">delete</span>
              Recently deleted ({trash.length})
            </span>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{showTrash ? "expand_less" : "expand_more"}</span>
          </button>
          {showTrash && (
            <div className="space-y-3 border-t border-border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-on-surface-variant">Hidden from the site. Restore them, or delete forever to free up storage.</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => restore(trash.map((m) => m.id))} className="h-8 text-xs">
                    Restore all
                  </Button>
                  <Button variant="outline" onClick={() => deleteForever(trash.map((m) => m.id))} className="h-8 text-xs !text-red-600">
                    Empty bin
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-8 gap-3">
                {trash.map((m) => (
                  <div key={m.id} className="flex flex-col gap-1.5">
                    <img src={m.kind === "video" ? m.poster || "" : m.url} alt="" loading="lazy" className="aspect-square w-full rounded-lg bg-muted object-cover opacity-70" />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => restore([m.id])}
                        className="flex-1 rounded-md border border-border py-1 text-[11px] hover:bg-surface-container-low cursor-pointer"
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteForever([m.id])}
                        title="Delete forever"
                        className="rounded-md border border-border px-1.5 text-red-600 hover:bg-red-500/10 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px] leading-none">delete_forever</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-on-surface-variant">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-on-surface-variant">No memories yet. Upload some photos above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((m, i) => (
            <div
              key={m.id}
              draggable
              onDragStart={() => setDragId(m.id)}
              onDragOver={(e) => dragId !== null && e.preventDefault()}
              onDrop={(e) => {
                if (dragId === null) return;
                e.preventDefault();
                move(items.findIndex((x) => x.id === dragId), i);
                setDragId(null);
              }}
              onDragEnd={() => setDragId(null)}
              className={`flex flex-col gap-2 rounded-xl border bg-background p-2 transition-all ${
                dragId === m.id ? "opacity-40 border-dashed border-primary" : selected.has(m.id) ? "border-primary ring-2 ring-primary/30" : "border-border"
              }`}
            >
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-grab active:cursor-grabbing">
                {m.kind === "video" ? (
                  m.poster ? (
                    <img src={m.poster} alt="" loading="lazy" className="size-full object-cover pointer-events-none" />
                  ) : (
                    <video src={m.url} muted preload="metadata" className="size-full object-cover pointer-events-none" />
                  )
                ) : (
                  <img src={m.url} alt="" loading="lazy" className="size-full object-cover pointer-events-none" />
                )}
                {m.kind === "video" && (
                  <span className="absolute bottom-1.5 left-1.5 flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                    <span className="material-symbols-outlined text-[12px]">play_arrow</span>
                    {formatDuration(m.duration || 0) || "Video"}
                  </span>
                )}
                <label className="absolute left-1.5 top-1.5 flex size-6 items-center justify-center rounded-md bg-black/50 cursor-pointer">
                  <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggle(m.id)} className="accent-[var(--brand)]" />
                </label>
                <span className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">#{i + 1}</span>
                {busyId === m.id && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs text-white">Working…</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button type="button" className={iconBtn} disabled={i === 0} onClick={() => move(i, i - 1)} title="Move earlier">
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
                <button type="button" className={iconBtn} disabled={i === items.length - 1} onClick={() => move(i, i + 1)} title="Move later">
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>
                <button
                  type="button"
                  className={iconBtn}
                  disabled={busyId !== null || m.kind === "video"}
                  onClick={() => recrop(m)}
                  title={m.kind === "video" ? "Videos can't be cropped" : "Crop"}
                >
                  <span className="material-symbols-outlined text-[16px]">crop</span>
                </button>
                <button
                  type="button"
                  onClick={() => remove([m.id])}
                  title="Delete"
                  className={`${iconBtn} ml-auto hover:!bg-red-500/10 hover:!text-red-600`}
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
              <input
                defaultValue={m.caption}
                onBlur={(e) => e.target.value !== m.caption && update(m.id, { caption: e.target.value })}
                placeholder="Caption"
                maxLength={200}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand/60"
              />
              <input
                defaultValue={m.takenOn}
                onBlur={(e) => e.target.value !== m.takenOn && update(m.id, { takenOn: e.target.value })}
                placeholder="Place / date (filter)"
                maxLength={80}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand/60"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
