import { NextResponse } from "next/server";
import { and, inArray, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { memories } from "@/lib/schema";
import { listPicked, type PickedSummary } from "@/lib/google-photos";

export const dynamic = "force-dynamic";

/**
 * Admin-only (proxy.ts). Lists one page of what was picked, so the admin panel
 * can import each photo/video in its own request (big videos never block the rest).
 *   { sessionId, pageToken? } → { items: PickedSummary[], nextPageToken }
 */
export async function POST(request: Request) {
  try {
    const { sessionId, pageToken } = await request.json();
    if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

    const page = await listPicked(String(sessionId), pageToken || undefined, 50);
    const picked = page.mediaItems ?? [];
    const ids = picked.map((i) => i.id);
    const existing = ids.length
      ? await db
          .select({ sourceId: memories.sourceId })
          .from(memories)
          .where(and(inArray(memories.sourceId, ids), isNull(memories.deletedAt)))
      : [];
    const seen = new Set(existing.map((e) => e.sourceId));

    const items: PickedSummary[] = picked.map((i) => {
      const isVideo = i.type === "VIDEO" || Boolean(i.mediaFile.mimeType?.startsWith("video/"));
      const status = i.mediaFile.mediaFileMetadata?.videoMetadata?.processingStatus;
      return {
        id: i.id,
        kind: isVideo ? "video" : "photo",
        filename: i.mediaFile.filename || (isVideo ? "video.mp4" : "photo.jpg"),
        mimeType: i.mediaFile.mimeType || "",
        baseUrl: i.mediaFile.baseUrl,
        width: i.mediaFile.mediaFileMetadata?.width || 0,
        height: i.mediaFile.mediaFileMetadata?.height || 0,
        createTime: i.createTime || null,
        ready: !isVideo || !status || status === "READY",
        alreadyAdded: seen.has(i.id),
      };
    });

    return NextResponse.json({ items, nextPageToken: page.nextPageToken || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
