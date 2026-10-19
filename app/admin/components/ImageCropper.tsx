"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { uploadFile } from "@/lib/upload-client";

export type AspectOption = { label: string; value: number | "original" };

export const ASPECTS = {
  square: { label: "Square", value: 1 },
  portrait: { label: "4:5", value: 4 / 5 },
  classic: { label: "4:3", value: 4 / 3 },
  wide: { label: "16:10", value: 16 / 10 },
  video: { label: "16:9", value: 16 / 9 },
  banner: { label: "2:1", value: 2 },
  original: { label: "Original", value: "original" as const },
} satisfies Record<string, AspectOption>;

export type CropOptions = {
  /** Shapes the user can pick from; the first is selected. */
  aspects?: AspectOption[];
  /** Show a circular guide (for profile photos). */
  round?: boolean;
  title?: string;
  /** Show "Use as is" (skip cropping) — handy when uploading several files. */
  allowSkip?: boolean;
  /** e.g. "Photo 2 of 5" */
  progress?: string;
};

type CropResult = { kind: "cropped"; blob: Blob } | { kind: "skip" } | { kind: "cancel" };

// `png` keeps transparency (logos); everything else is saved as JPEG.
type Request = CropOptions & { src: string; png: boolean; resolve: (r: CropResult) => void };

const MAX_SIDE = 2400;

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't load the image"));
    img.src = src;
  });
}

/** Draws the selected area (with rotation) onto a canvas and returns it as a file blob. */
async function cropToBlob(src: string, area: Area, rotation: number, type: string): Promise<Blob> {
  const img = await loadImage(src);
  const rad = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(rad));
  const cos = Math.abs(Math.cos(rad));
  const boxW = img.width * cos + img.height * sin;
  const boxH = img.width * sin + img.height * cos;

  // Rotate the whole image first, then cut out the selected area.
  const rotated = document.createElement("canvas");
  rotated.width = boxW;
  rotated.height = boxH;
  const rctx = rotated.getContext("2d")!;
  rctx.translate(boxW / 2, boxH / 2);
  rctx.rotate(rad);
  rctx.drawImage(img, -img.width / 2, -img.height / 2);

  const scale = Math.min(1, MAX_SIDE / Math.max(area.width, area.height));
  const out = document.createElement("canvas");
  out.width = Math.round(area.width * scale);
  out.height = Math.round(area.height * scale);
  const octx = out.getContext("2d")!;
  octx.imageSmoothingQuality = "high";
  octx.drawImage(rotated, area.x, area.y, area.width, area.height, 0, 0, out.width, out.height);

  return new Promise((resolve, reject) => {
    try {
      out.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't create the image"))), type, 0.9);
    } catch {
      // Images from other websites can't be read back for security reasons.
      reject(new Error("This image is hosted on another website and can't be cropped here. Download it and upload it again."));
    }
  });
}

function CropDialog({ request, onClose }: { request: Request; onClose: (r: CropResult) => void }) {
  const aspects = request.aspects?.length ? request.aspects : [ASPECTS.original];
  const [aspect, setAspect] = useState<AspectOption>(aspects[0]);
  const [natural, setNatural] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const ratio = aspect.value === "original" ? natural : aspect.value;

  const done = async () => {
    if (!area) return;
    setBusy(true);
    setError("");
    try {
      const blob = await cropToBlob(request.src, area, rotation, request.png ? "image/png" : "image/jpeg");
      onClose({ kind: "cropped", blob });
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose({ kind: "cancel" });
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
          <div>
            <h3 className="font-space text-base font-medium">{request.title || "Crop image"}</h3>
            {request.progress && <p className="text-[11px] text-muted-foreground">{request.progress}</p>}
          </div>
          <button
            type="button"
            onClick={() => onClose({ kind: "cancel" })}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
            title="Cancel"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="relative h-[55vh] min-h-[300px] bg-neutral-900">
          <Cropper
            image={request.src}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={ratio}
            cropShape={request.round ? "round" : "rect"}
            showGrid={!request.round}
            minZoom={1}
            maxZoom={5}
            zoomSpeed={0.15}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={(_, pixels) => setArea(pixels)}
            onMediaLoaded={(m) => setNatural(m.naturalWidth / m.naturalHeight)}
          />
        </div>

        <div className="space-y-4 px-5 py-4">
          {aspects.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Shape</span>
              {aspects.map((a) => (
                <button
                  key={a.label}
                  type="button"
                  onClick={() => setAspect(a)}
                  className={`h-7 rounded-md border px-2.5 text-xs transition-colors cursor-pointer ${
                    aspect.label === a.label
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex flex-1 min-w-[200px] items-center gap-3">
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">zoom_out</span>
              <input
                type="range"
                min={1}
                max={5}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-[var(--brand)]"
                aria-label="Zoom"
              />
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">zoom_in</span>
            </label>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setRotation((r) => (r - 90) % 360)}
                className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="Rotate left"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_left</span>
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="flex h-8 items-center gap-1 rounded-md border border-border px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                title="Rotate right"
              >
                <span className="material-symbols-outlined text-[16px]">rotate_right</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setRotation(0);
                  setCrop({ x: 0, y: 0 });
                }}
                className="h-8 rounded-md border border-border px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          <p className="text-[11px] text-muted-foreground">Drag to move · scroll or pinch to zoom.</p>
          {error && <p className="text-xs text-destructive">{error}</p>}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={() => onClose({ kind: "cancel" })}
              className="h-9 rounded-lg px-4 text-sm text-muted-foreground hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            {request.allowSkip && (
              <button
                type="button"
                onClick={() => onClose({ kind: "skip" })}
                className="h-9 rounded-lg border border-border px-4 text-sm hover:bg-muted cursor-pointer"
              >
                Use as is
              </button>
            )}
            <button
              type="button"
              onClick={done}
              disabled={busy || !area}
              className="h-9 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 cursor-pointer"
            >
              {busy ? "Cropping…" : "Crop & use"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Cropping + uploading for admin forms.
 *
 *   const { cropper, cropAndUpload, cropExisting } = useImageCrop();
 *   const urls = await cropAndUpload(files, { aspects: [ASPECTS.square], round: true });
 *   const url  = await cropExisting(currentUrl, { aspects: [...] });
 *   return <>{cropper} ...</>
 */
export function useImageCrop() {
  const [request, setRequest] = useState<Request | null>(null);

  const ask = useCallback(
    (src: string, png: boolean, opts: CropOptions) =>
      new Promise<CropResult>((resolve) => setRequest({ ...opts, src, png, resolve })),
    []
  );

  const close = useCallback(
    (result: CropResult) => {
      setRequest((r) => {
        r?.resolve(result);
        return null;
      });
    },
    []
  );

  /** Crop each image (videos/other files pass straight through), then upload. Returns the URLs. */
  const cropAndUpload = useCallback(
    async (
      files: File[] | FileList,
      opts: CropOptions & { category?: string; onProgress?: (percent: number) => void } = {}
    ): Promise<string[]> => {
      const list = Array.from(files);
      const urls: string[] = [];
      for (let i = 0; i < list.length; i++) {
        const file = list[i];
        let toUpload: File = file;
        if (file.type.startsWith("image/") && file.type !== "image/gif" && file.type !== "image/svg+xml") {
          const objectUrl = URL.createObjectURL(file);
          const result = await ask(objectUrl, file.type === "image/png" || file.type === "image/webp", {
            ...opts,
            allowSkip: true,
            progress: list.length > 1 ? `Photo ${i + 1} of ${list.length} · ${file.name}` : file.name,
          });
          URL.revokeObjectURL(objectUrl);
          if (result.kind === "cancel") continue;
          if (result.kind === "cropped") {
            const ext = result.blob.type === "image/png" ? "png" : "jpg";
            toUpload = new File([result.blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: result.blob.type });
          }
        }
        try {
          urls.push(await uploadFile(toUpload, { category: opts.category, onProgress: opts.onProgress }));
        } catch (err: any) {
          alert(`Couldn't upload ${file.name}: ${err.message}`);
        }
      }
      return urls;
    },
    [ask]
  );

  /** Re-crop an image that is already uploaded. Returns the new URL, or null if cancelled. */
  const cropExisting = useCallback(
    async (url: string, opts: CropOptions & { category?: string } = {}): Promise<string | null> => {
      const result = await ask(url, /\.(png|webp)($|\?)/i.test(url), { ...opts, allowSkip: false });
      if (result.kind !== "cropped") return null;
      const name = (url.split("/").pop() || "image").split("?")[0].replace(/\.[^.]+$/, "");
      const ext = result.blob.type === "image/png" ? "png" : "jpg";
      try {
        return await uploadFile(new File([result.blob], `${name}-cropped.${ext}`, { type: result.blob.type }), {
          category: opts.category,
        });
      } catch (err: any) {
        alert("Couldn't upload the cropped image: " + err.message);
        return null;
      }
    },
    [ask]
  );

  const cropper = request ? <CropDialog key={request.src} request={request} onClose={close} /> : null;
  return { cropper, cropAndUpload, cropExisting };
}
