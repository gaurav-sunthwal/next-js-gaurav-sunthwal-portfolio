// Microsoft Clarity helpers (https://learn.microsoft.com/clarity/setup-and-installation/clarity-api).
// Safe to call anywhere in the browser: calls are queued until Clarity has loaded,
// and do nothing on the server or when Clarity isn't on the page (e.g. /admin).

type ClarityFn = (...args: unknown[]) => void;

function clarity(): ClarityFn | null {
  if (typeof window === "undefined") return null;
  return ((window as unknown as { clarity?: ClarityFn }).clarity as ClarityFn) ?? null;
}

const clean = (value: unknown) => String(value ?? "").trim().slice(0, 120);

/**
 * Records a named event, optionally with tags that become filters in Clarity.
 * Example: track("project_open", { project: "rolesetu" })
 */
export function track(event: string, tags?: Record<string, unknown>) {
  const c = clarity();
  if (!c) return;
  if (tags) {
    for (const [key, value] of Object.entries(tags)) {
      if (value !== undefined && value !== null && value !== "") c("set", key, clean(value));
    }
  }
  c("event", event);
}

/** Adds a filterable tag to the current session (e.g. which page type). */
export function setTag(key: string, value: unknown) {
  clarity()?.("set", key, clean(value));
}

/** Tells Clarity this session matters (e.g. someone contacted you) so it is always kept. */
export function prioritizeSession(reason: string) {
  clarity()?.("upgrade", reason);
}
