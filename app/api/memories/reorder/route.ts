import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { memories } from "@/lib/schema";

/** Admin-only (proxy.ts). { ids: number[] } in the new order. */
export async function POST(request: Request) {
  try {
    const { ids } = await request.json();
    if (!Array.isArray(ids)) return NextResponse.json({ error: "ids must be an array" }, { status: 400 });
    await Promise.all(ids.map((id: number, position: number) => db.update(memories).set({ position }).where(eq(memories.id, Number(id)))));
    revalidatePath("/memories");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
