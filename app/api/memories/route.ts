import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, isNotNull, isNull } from "drizzle-orm";
import { nextMemoryPosition } from "@/lib/memories";
import { db } from "@/lib/db";
import { memories } from "@/lib/schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Public: the visible photos. Admin with ?trash=1: the "Recently deleted" bin. */
export async function GET(request: Request) {
  try {
    const trash = new URL(request.url).searchParams.get("trash") === "1";
    if (trash) {
      if (!(await getSession())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const list = await db.select().from(memories).where(isNotNull(memories.deletedAt)).orderBy(desc(memories.deletedAt));
      return NextResponse.json(list);
    }
    const list = await db
      .select()
      .from(memories)
      .where(isNull(memories.deletedAt))
      .orderBy(asc(memories.position), asc(memories.id));
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

type Input = {
  url?: string;
  caption?: string;
  takenOn?: string;
  width?: number;
  height?: number;
  source?: string;
  sourceId?: string | null;
  kind?: string;
  poster?: string | null;
  duration?: number;
};

const clean = (m: Input) => ({
  ...(m.url !== undefined && { url: String(m.url).trim() }),
  ...(m.caption !== undefined && { caption: String(m.caption).slice(0, 200) }),
  ...(m.takenOn !== undefined && { takenOn: String(m.takenOn).slice(0, 80) }),
  ...(m.width !== undefined && { width: Math.max(0, Math.round(Number(m.width) || 0)) }),
  ...(m.height !== undefined && { height: Math.max(0, Math.round(Number(m.height) || 0)) }),
  ...(m.source !== undefined && { source: String(m.source).slice(0, 40) }),
  ...(m.sourceId !== undefined && { sourceId: m.sourceId ? String(m.sourceId).slice(0, 200) : null }),
  ...(m.kind !== undefined && { kind: m.kind === "video" ? "video" : "photo" }),
  ...(m.poster !== undefined && { poster: m.poster ? String(m.poster).trim() : null }),
  ...(m.duration !== undefined && { duration: Math.max(0, Math.round(Number(m.duration) || 0)) }),
});

/**
 * Admin-only (proxy.ts).
 *   { items: [{ url, caption?, takenOn?, width?, height?, source?, sourceId? }] } → add to the end
 *   { id, ...fields }                → update one photo
 *   { id, restore: true }            → bring back from "Recently deleted"
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.id && body.restore) {
      await db
        .update(memories)
        .set({ deletedAt: null, position: await nextMemoryPosition() })
        .where(and(eq(memories.id, Number(body.id)), isNotNull(memories.deletedAt)));
    } else if (body.id) {
      await db.update(memories).set(clean(body)).where(eq(memories.id, Number(body.id)));
    } else {
      const items: Input[] = Array.isArray(body.items) ? body.items : [];
      const valid = items.filter((m) => m.url && String(m.url).trim());
      if (valid.length === 0) return NextResponse.json({ error: "No photos to add" }, { status: 400 });
      const start = await nextMemoryPosition();
      await db.insert(memories).values(
        valid.map((m, i) => ({
          url: String(m.url).trim(),
          caption: "",
          takenOn: "",
          width: 0,
          height: 0,
          ...clean(m),
          position: start + i,
        }))
      );
    }

    revalidatePath("/memories");
    revalidatePath("/about");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
