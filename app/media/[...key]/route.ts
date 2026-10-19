import { getObject } from "@/lib/r2";

// Serves files from the Cloudflare R2 bucket at /media/<key>, so uploads work
// without the bucket being public. Responses are cached for a year by browsers
// and Vercel's CDN (every upload gets a unique key, so files never change).
export async function GET(request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await params;
  const key = parts.map(decodeURIComponent).join("/");
  if (!key || key.includes("..")) return new Response("Not found", { status: 404 });

  try {
    const range = request.headers.get("range");
    const obj = await getObject(key, range);
    if (!obj.Body) return new Response("Not found", { status: 404 });

    const headers = new Headers({
      "Content-Type": obj.ContentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
      "Accept-Ranges": "bytes",
    });
    if (obj.ContentLength != null) headers.set("Content-Length", String(obj.ContentLength));
    if (obj.ContentRange) headers.set("Content-Range", obj.ContentRange);
    if (obj.ETag) headers.set("ETag", obj.ETag);

    return new Response(obj.Body.transformToWebStream(), { status: obj.ContentRange ? 206 : 200, headers });
  } catch (err: any) {
    const status = err?.$metadata?.httpStatusCode;
    if (status === 404 || err?.name === "NoSuchKey") return new Response("Not found", { status: 404 });
    if (status === 416) return new Response("Range not satisfiable", { status: 416 });
    console.error("[media] Failed to read", key, err);
    return new Response("Failed to load file", { status: 500 });
  }
}
