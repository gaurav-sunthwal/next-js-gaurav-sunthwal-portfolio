import { NextResponse } from "next/server";
import { deleteSession } from "@/lib/google-photos";

/** Admin-only (proxy.ts). Closes the picker session once everything is imported. */
export async function POST(request: Request) {
  const { sessionId } = await request.json().catch(() => ({}));
  if (sessionId) await deleteSession(String(sessionId));
  return NextResponse.json({ success: true });
}
