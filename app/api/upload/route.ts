import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadedFiles } from "@/lib/schema";
import { buildKey, checkSize, presignUpload, publicUrlFor, putObject, putObjectStream } from "@/lib/r2";

// Copying a video from a link can take a while.
export const maxDuration = 300;

// Admin-only (enforced in proxy.ts).
//
// Ways to upload to Cloudflare R2:
// 1. Direct (preferred, any size up to 200 MB):
//      POST { action: "presign", name, type, size, category } → { uploadUrl, url, key }
//      browser PUTs the file to uploadUrl
//      POST { action: "complete", key, name, type, size, category } → records it in Files
// 2. Through this server (small files only, ~4 MB on Vercel):
//      POST multipart form-data with `file` (+ optional `category`) → { url }
// 3. Import from a link (copies an image from another website into R2):
//      POST { action: "import", url, category } → { url, name, type, size }

async function record(name: string, url: string, type: string, size: number, category: string) {
  try {
    await db.insert(uploadedFiles).values({ name, url, type: type || "application/octet-stream", size: size || 0, category });
  } catch (err) {
    console.error("Failed to save upload metadata:", err);
  }
}

const MAX_IMPORT_BYTES = 50 * 1024 * 1024;

/** Downloads an image from a public link and stores a copy in R2. */
async function importFromUrl(rawUrl: string, category: string) {
  let source: URL;
  try {
    source = new URL(rawUrl.trim());
  } catch {
    throw new Error("That isn't a valid link.");
  }
  if (!["http:", "https:"].includes(source.protocol)) throw new Error("Only http(s) links are supported.");

  const res = await fetch(source, {
    redirect: "follow",
    headers: { "User-Agent": "Mozilla/5.0 (portfolio image import)", Accept: "image/*" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`The link returned ${res.status}.`);

  const type = (res.headers.get("content-type") || "").split(";")[0].trim();
  const isVideo = type.startsWith("video/");
  if (!type.startsWith("image/") && !isVideo) {
    throw new Error("That link is a web page, not a photo or video file. Right-click the photo → “Copy image address” and paste that.");
  }

  const ext =
    type.split("/")[1]?.replace("jpeg", "jpg").replace("quicktime", "mov").replace(/[^a-z0-9]/g, "") || (isVideo ? "mp4" : "jpg");
  const base = decodeURIComponent(source.pathname.split("/").pop() || "").replace(/\.[^.]+$/, "") || "imported";
  const name = `${base}.${ext}`;
  const key = buildKey(name, category);

  let size: number;
  if (isVideo && res.body) {
    // Videos are streamed straight into storage (up to 1 GB).
    size = await putObjectStream(key, res.body, type);
  } else {
    const declared = Number(res.headers.get("content-length") || 0);
    if (declared > MAX_IMPORT_BYTES) throw new Error("Image is larger than 50 MB.");
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (bytes.byteLength > MAX_IMPORT_BYTES) throw new Error("Image is larger than 50 MB.");
    await putObject(key, bytes, type);
    size = bytes.byteLength;
  }
  const url = publicUrlFor(key);
  await record(name, url, type, size, category);
  return { url, name, type, size, kind: isVideo ? "video" : "photo" };
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      const category = typeof body.category === "string" ? body.category : "website";

      if (body.action === "presign") {
        const name = String(body.name || "file");
        const type = String(body.type || "application/octet-stream");
        checkSize(Number(body.size) || 0);
        const key = buildKey(name, category);
        const uploadUrl = await presignUpload(key, type);
        return NextResponse.json({ uploadUrl, key, url: publicUrlFor(key) });
      }

      if (body.action === "complete") {
        const key = String(body.key || "");
        if (!key) return NextResponse.json({ error: "Missing key" }, { status: 400 });
        const url = publicUrlFor(key);
        await record(String(body.name || key), url, String(body.type || ""), Number(body.size) || 0, category);
        return NextResponse.json({ url });
      }

      if (body.action === "import") {
        return NextResponse.json(await importFromUrl(String(body.url || ""), category));
      }

      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    // Multipart fallback
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "website";
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    checkSize(file.size);

    const key = buildKey(file.name, category);
    await putObject(key, new Uint8Array(await file.arrayBuffer()), file.type || "application/octet-stream");
    const url = publicUrlFor(key);
    await record(file.name, url, file.type, file.size, category);
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message || "Upload failed" }, { status: 500 });
  }
}
