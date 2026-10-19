import { NextResponse } from "next/server";
import { disconnect } from "@/lib/google-photos";

// Admin-only (proxy.ts).
export async function POST() {
  await disconnect();
  return NextResponse.json({ success: true });
}
