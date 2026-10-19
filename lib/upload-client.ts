// Browser helper used by every admin upload button.
// Uploads straight to Cloudflare R2 with a signed URL (shows real progress,
// works for large files). If the direct upload is blocked (e.g. bucket CORS
// not set up yet), small files fall back to going through our server.

const SERVER_FALLBACK_LIMIT = 4 * 1024 * 1024;

type Options = { category?: string; onProgress?: (percent: number) => void };

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  return data as T;
}

function putWithProgress(url: string, file: File, onProgress?: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Storage responded ${xhr.status}`)));
    xhr.onerror = () => reject(new Error("Direct upload was blocked (check the R2 bucket CORS settings)"));
    xhr.send(file);
  });
}

async function viaServer(file: File, category: string, onProgress?: (p: number) => void) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  const { url } = await json<{ url: string }>(await fetch("/api/upload", { method: "POST", body: formData }));
  onProgress?.(100);
  return url;
}

/** Uploads a file and returns its public URL. */
export async function uploadFile(file: File, { category = "website", onProgress }: Options = {}): Promise<string> {
  const meta = { name: file.name, type: file.type || "application/octet-stream", size: file.size, category };

  const { uploadUrl, key } = await json<{ uploadUrl: string; key: string }>(
    await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "presign", ...meta }),
    })
  );

  try {
    await putWithProgress(uploadUrl, file, onProgress);
  } catch (err) {
    if (file.size <= SERVER_FALLBACK_LIMIT) {
      console.warn("Direct R2 upload failed, retrying through the server:", err);
      return viaServer(file, category, onProgress);
    }
    throw err;
  }

  const { url } = await json<{ url: string }>(
    await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete", key, ...meta }),
    })
  );
  return url;
}

/** Copies an image from another website into our storage. Returns the new URL. */
export async function importFromUrl(url: string, category = "website"): Promise<string> {
  return (await importFromUrlDetailed(url, category)).url;
}

/** Same as importFromUrl, but also says whether it was a photo or a video. */
export async function importFromUrlDetailed(url: string, category = "website") {
  return json<{ url: string; type: string; kind: "photo" | "video" }>(
    await fetch("/api/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "import", url, category }),
    })
  );
}
