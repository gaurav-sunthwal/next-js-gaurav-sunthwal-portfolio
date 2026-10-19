import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { memories, uploadedFiles } from "@/lib/schema";
import { deleteObject, keyFromUrl } from "@/lib/r2";

/**
 * Admin-only (proxy.ts).
 *   DELETE /api/memories/:id            → move to "Recently deleted" (can be restored)
 *   DELETE /api/memories/:id?forever=1  → remove for good, including the stored file
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const forever = new URL(request.url).searchParams.get("forever") === "1";

    if (!forever) {
      await db.update(memories).set({ deletedAt: new Date() }).where(eq(memories.id, Number(id)));
    } else {
      const [row] = await db.delete(memories).where(eq(memories.id, Number(id))).returning();
      if (row) {
        // Remove the stored file (and a video's cover) unless another memory still uses it.
        for (const fileUrl of [row.url, row.poster].filter(Boolean) as string[]) {
          const others = await db.select({ id: memories.id }).from(memories).where(eq(memories.url, fileUrl));
          const key = keyFromUrl(fileUrl);
          if (key && others.length === 0) {
            await deleteObject(key).catch((err) => console.error("[memories] R2 delete failed", err));
            await db.delete(uploadedFiles).where(eq(uploadedFiles.url, fileUrl)).catch(() => {});
          }
        }
      }
    }

    revalidatePath("/memories");
    revalidatePath("/about");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
