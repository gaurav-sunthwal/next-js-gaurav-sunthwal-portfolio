import { NextResponse } from "next/server";
import { createSession, getPickerSession } from "@/lib/google-photos";

export const dynamic = "force-dynamic";

/** Admin-only (proxy.ts). Starts a Google Photos picker session. */
export async function POST() {
  try {
    const s = await createSession();
    return NextResponse.json({ id: s.id, pickerUri: s.pickerUri });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/** Admin-only (proxy.ts). Has the user finished picking yet? */
export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id") || "";
    const s = await getPickerSession(id);
    // Google says how often to check and how long the picker stays open ("3s", "1799.5s").
    const poll = parseFloat(s.pollingConfig?.pollInterval || "3");
    const timeout = parseFloat(s.pollingConfig?.timeoutIn || "0");
    return NextResponse.json({
      done: Boolean(s.mediaItemsSet),
      pollMs: Math.max(1500, Math.round(poll * 1000)),
      // 0 means Google stopped waiting (the picker session expired).
      remainingMs: s.mediaItemsSet ? 0 : Math.max(0, Math.round(timeout * 1000)),
      expireTime: s.expireTime || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
