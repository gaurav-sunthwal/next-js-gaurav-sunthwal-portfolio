import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

// Admin-only (enforced in proxy.ts). Called after any content change so the
// public pages show the update straight away instead of after the cache expires.
export async function POST() {
  revalidatePath("/", "layout");
  return NextResponse.json({ revalidated: true, at: Date.now() });
}
