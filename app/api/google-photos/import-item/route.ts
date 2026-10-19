import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { memories, uploadedFiles } from "@/lib/schema";
import { buildKey, publicUrlFor, putObject, putObjectStream } from "@/lib/r2";
import { nextMemoryPosition } from "@/lib/memories";
import {
  downloadPhoto,
  downloadVideoThumbnail,
  openVideoStream,
  type PickedMediaItem,
  type PickedSummary,
} from "@/lib/google-photos";

// Videos can take a while to copy; this is the most Vercel allows on its plan.
export const maxDuration = 300;

const takenLabel = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "";

/**
 * Admin-only (proxy.ts). Copies ONE picked photo or video into R2 and adds it to Memories.
 *   { item: PickedSummary } → { added: true, kind } | { skipped: reason }
 */
export async function POST(request: Request) {
  try {
    const { item } = (await request.json()) as { item: PickedSummary };
    if (!item?.id || !item.baseUrl) return NextResponse.json({ error: "Missing item" }, { status: 400 });
    if (item.alreadyAdded) return NextResponse.json({ skipped: "already added" });

    const record = (name: string, url: string, type: string, size: number) =>
      db.insert(uploadedFiles).values({ name, url, type, size, category: "memories" }).catch(() => {});

    let row: typeof memories.$inferInsert;

    if (item.kind === "video") {
      if (!item.ready) return NextResponse.json({ skipped: "still processing in Google Photos — try again later" });

      // Cover image first (small), then stream the video itself.
      const thumb = await downloadVideoThumbnail(item.baseUrl);
      const posterKey = buildKey(item.filename.replace(/\.[^.]+$/, "") + "-cover.jpg", "memories");
      await putObject(posterKey, thumb.bytes, thumb.type);
      const poster = publicUrlFor(posterKey);
      await record(item.filename + " (cover)", poster, thumb.type, thumb.bytes.byteLength);

      const video = await openVideoStream(item.baseUrl);
      const ext = video.type.includes("webm") ? "webm" : video.type.includes("quicktime") ? "mov" : "mp4";
      const key = buildKey(item.filename.replace(/\.[^.]+$/, "") + "." + ext, "memories");
      const size = await putObjectStream(key, video.body, video.type);
      const url = publicUrlFor(key);
      await record(item.filename, url, video.type, size);

      row = { url, poster, kind: "video", width: item.width, height: item.height, takenOn: takenLabel(item.createTime), caption: "", source: "google-photos", sourceId: item.id, position: 0 };
    } else {
      const photo = await downloadPhoto({
        id: item.id,
        mediaFile: { baseUrl: item.baseUrl, mimeType: item.mimeType, filename: item.filename, mediaFileMetadata: { width: item.width, height: item.height } },
      } as PickedMediaItem);
      const key = buildKey(item.filename, "memories");
      await putObject(key, photo.bytes, photo.type);
      const url = publicUrlFor(key);
      await record(item.filename, url, photo.type, photo.bytes.byteLength);
      row = { url, kind: "photo", width: photo.width, height: photo.height, takenOn: takenLabel(item.createTime), caption: "", source: "google-photos", sourceId: item.id, position: 0 };
    }

    await db.insert(memories).values({ ...row, position: await nextMemoryPosition() });
    revalidatePath("/memories");
    revalidatePath("/about");
    return NextResponse.json({ added: true, kind: item.kind });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
