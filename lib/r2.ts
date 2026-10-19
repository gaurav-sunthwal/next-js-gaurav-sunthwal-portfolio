import "server-only";
import { randomUUID } from "crypto";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Upload } from "@aws-sdk/lib-storage";

/*
 * Cloudflare R2 storage (S3-compatible). Needs these environment variables:
 *   R2_ACCOUNT_ID         Cloudflare account id
 *   R2_ACCESS_KEY_ID      R2 API token: access key id
 *   R2_SECRET_ACCESS_KEY  R2 API token: secret access key
 *   R2_BUCKET             bucket name (gaurav-portfolio)
 *   R2_PUBLIC_URL         (optional) public URL of the bucket, e.g. https://pub-xxxx.r2.dev
 *                         or a custom domain. When it's not set, files are served by
 *                         this site at /media/<key> (see app/media/[...key]/route.ts).
 */

const MAX_UPLOAD_BYTES = 1024 * 1024 * 1024; // 1 GB per file (videos)

function config() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET || "gaurav-portfolio";
  const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "") || "";

  const missing = [
    !accountId && "R2_ACCOUNT_ID",
    !accessKeyId && "R2_ACCESS_KEY_ID",
    !secretAccessKey && "R2_SECRET_ACCESS_KEY",
  ].filter(Boolean);
  if (missing.length) {
    throw new Error(`Cloudflare R2 is not configured. Missing: ${missing.join(", ")}`);
  }
  return { accountId: accountId!, accessKeyId: accessKeyId!, secretAccessKey: secretAccessKey!, bucket, publicUrl };
}

let client: S3Client | null = null;
function s3() {
  if (!client) {
    const c = config();
    client = new S3Client({
      region: "auto",
      endpoint: `https://${c.accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: c.accessKeyId, secretAccessKey: c.secretAccessKey },
    });
  }
  return client;
}

export function isR2Configured() {
  try {
    config();
    return true;
  } catch {
    return false;
  }
}

/** "website/2026/10/3f2c…-my-photo.jpg" — unique, readable, grouped by month. */
export function buildKey(fileName: string, category: string) {
  const now = new Date();
  const month = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const dot = fileName.lastIndexOf(".");
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) : "";
  const base = (dot > 0 ? fileName.slice(0, dot) : fileName)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "file";
  const safeCategory = category.replace(/[^a-z0-9-]/gi, "") || "website";
  return `${safeCategory}/${month}/${randomUUID().slice(0, 8)}-${base}${ext ? "." + ext : ""}`;
}

export const MEDIA_PREFIX = "/media/";

/** Where a stored file can be viewed: the bucket's public URL if set, else served by this site. */
export function publicUrlFor(key: string) {
  const base = config().publicUrl;
  return base ? `${base}/${key}` : `${MEDIA_PREFIX}${key}`;
}

/** Returns the object key if `url` points into our R2 bucket, otherwise null. */
export function keyFromUrl(url: string) {
  const clean = url.split("?")[0];
  if (clean.startsWith(MEDIA_PREFIX)) return decodeURIComponent(clean.slice(MEDIA_PREFIX.length));
  const base = process.env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  if (base && clean.startsWith(base + "/")) return decodeURIComponent(clean.slice(base.length + 1));
  return null;
}

/** Streams an object out of the bucket (used by the /media route). */
export async function getObject(key: string, range?: string | null) {
  return s3().send(new GetObjectCommand({ Bucket: config().bucket, Key: key, Range: range || undefined }));
}

export function checkSize(size: number) {
  if (size > MAX_UPLOAD_BYTES) {
    throw new Error(`File is too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).`);
  }
}

const CACHE_CONTROL = "public, max-age=31536000, immutable";

/** Signed URL the browser can PUT the file to directly (valid 10 minutes). */
export async function presignUpload(key: string, contentType: string) {
  return getSignedUrl(
    s3(),
    new PutObjectCommand({ Bucket: config().bucket, Key: key, ContentType: contentType, CacheControl: CACHE_CONTROL }),
    { expiresIn: 600 }
  );
}

/** Server-side upload (used as a fallback for small files). */
export async function putObject(key: string, body: Uint8Array, contentType: string) {
  await s3().send(
    new PutObjectCommand({ Bucket: config().bucket, Key: key, Body: body, ContentType: contentType, CacheControl: CACHE_CONTROL })
  );
}

/**
 * Streams data into the bucket without holding it all in memory (used for
 * large files like videos copied from Google Photos). Returns bytes written.
 */
export async function putObjectStream(key: string, body: ReadableStream<Uint8Array>, contentType: string) {
  let bytes = 0;
  const counted = body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > MAX_UPLOAD_BYTES) throw new Error("File is larger than 1 GB.");
        controller.enqueue(chunk);
      },
    })
  );
  const upload = new Upload({
    client: s3(),
    params: { Bucket: config().bucket, Key: key, Body: counted, ContentType: contentType, CacheControl: CACHE_CONTROL },
    partSize: 10 * 1024 * 1024,
    queueSize: 3,
  });
  await upload.done();
  return bytes;
}

export async function deleteObject(key: string) {
  await s3().send(new DeleteObjectCommand({ Bucket: config().bucket, Key: key }));
}
