import React, { useMemo, useRef, useState } from "react";
import { useImageCrop, ASPECTS } from "@/app/admin/components/ImageCropper";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { SITE_SETTING_DEFAULTS, splitLines } from "@/lib/site-settings";

type Photo = { url: string; caption: string };

const GALLERY_LIMIT = 12;
const GALLERY_RECOMMENDED = 6;
const AVATAR_LIMIT = 6;

const parseGallery = (value: string): Photo[] =>
  splitLines(value).map((line) => {
    const [url, caption] = line.split("|").map((s) => s.trim());
    return { url, caption: caption || "" };
  });

const serializeGallery = (photos: Photo[]) =>
  photos.map((p) => (p.caption ? `${p.url} | ${p.caption.replace(/\|/g, "/")}` : p.url)).join("\n");


/** Grid of photos with upload, replace, reorder, make-main, delete and optional captions. */
function PhotoGrid({
  photos,
  onChange,
  limit,
  withCaptions,
  aspect,
  noun,
}: {
  photos: Photo[];
  onChange: (photos: Photo[]) => void;
  limit: number;
  withCaptions: boolean;
  aspect: "square" | "wide";
  noun: string;
}) {
  const [uploading, setUploading] = useState(0);
  const [replacing, setReplacing] = useState<number | null>(null);
  const { cropper, cropAndUpload, cropExisting } = useImageCrop();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<number | null>(null);
  const room = limit - photos.length;
  const isSquare = aspect === "square";
  // Profile photos are square with a round guide; gallery photos default to landscape.
  const cropOptions = isSquare
    ? { aspects: [ASPECTS.square], round: true, title: "Crop profile photo" }
    : { aspects: [ASPECTS.wide, ASPECTS.classic, ASPECTS.video, ASPECTS.square, ASPECTS.portrait, ASPECTS.original], title: "Crop gallery photo" };

  const addFiles = async (files: FileList | File[]) => {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (list.length === 0) return;
    setUploading(list.length);
    const urls = await cropAndUpload(list, cropOptions);
    setUploading(0);
    onChange([...photos, ...urls.map((url) => ({ url, caption: "" }))]);
  };

  const replaceAt = async (index: number, file: File) => {
    setReplacing(index);
    const [url] = await cropAndUpload([file], cropOptions);
    setReplacing(null);
    if (url) onChange(photos.map((p, j) => (j === index ? { ...p, url } : p)));
  };

  const move = (from: number, to: number) => {
    if (to < 0 || to >= photos.length || from === to) return;
    const next = [...photos];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (index: number) => onChange(photos.filter((_, j) => j !== index));

  const recrop = async (index: number) => {
    setReplacing(index);
    const url = await cropExisting(photos[index].url, cropOptions);
    setReplacing(null);
    if (url) onChange(photos.map((p, j) => (j === index ? { ...p, url } : p)));
  };

  const iconBtn =
    "flex size-7 items-center justify-center rounded-md border border-border bg-background text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface disabled:opacity-30 disabled:pointer-events-none cursor-pointer";

  return (
    <div className="space-y-4">
      {cropper}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-on-surface-variant">
          {photos.length} of {limit} {noun}
          {photos.length === 1 ? "" : "s"} · drag photos to reorder
        </span>
        {photos.length > 0 && (
          <button
            type="button"
            onClick={() => confirm(`Remove all ${photos.length} ${noun}s?`) && onChange([])}
            className="text-xs font-medium text-destructive hover:underline cursor-pointer"
          >
            Remove all
          </button>
        )}
      </div>

      <div className={`grid gap-4 ${isSquare ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"}`}>
        {photos.map((photo, i) => (
          <div
            key={photo.url + i}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) return;
              if (dragIndex !== null) move(dragIndex, i);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex flex-col gap-2 rounded-xl border bg-background p-2 transition-all ${
              dragIndex === i ? "opacity-40 border-dashed border-primary" : "border-border"
            }`}
          >
            <div className={`relative overflow-hidden rounded-lg bg-muted cursor-grab active:cursor-grabbing ${isSquare ? "aspect-square" : "aspect-[16/10]"}`}>
              <img src={photo.url} alt="" className="size-full object-cover pointer-events-none" />
              <span
                className={`absolute left-1.5 top-1.5 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white ${
                  i === 0 && isSquare ? "bg-primary" : "bg-black/60"
                }`}
              >
                {i === 0 && isSquare ? "Main photo" : `#${i + 1}`}
              </span>
              {replacing === i && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-xs font-medium text-white">
                  Uploading…
                </span>
              )}
            </div>

            {/* Always-visible controls */}
            <div className="flex items-center gap-1">
              <button type="button" className={iconBtn} disabled={i === 0} onClick={() => move(i, i - 1)} title="Move earlier">
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button type="button" className={iconBtn} disabled={i === photos.length - 1} onClick={() => move(i, i + 1)} title="Move later">
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
              <button
                type="button"
                className={iconBtn}
                disabled={replacing !== null}
                onClick={() => {
                  replaceTarget.current = i;
                  replaceRef.current?.click();
                }}
                title="Replace with a new photo"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              </button>
              <button type="button" className={iconBtn} disabled={replacing !== null} onClick={() => recrop(i)} title="Crop">
                <span className="material-symbols-outlined text-[16px]">crop</span>
              </button>
              {isSquare && (
                <button type="button" className={iconBtn} disabled={i === 0} onClick={() => move(i, 0)} title="Make this the main photo">
                  <span className="material-symbols-outlined text-[16px]">star</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                title="Delete"
                className={`${iconBtn} ml-auto hover:!bg-red-500/10 hover:!text-red-600`}
              >
                <span className="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>

            {withCaptions && (
              <input
                value={photo.caption}
                onChange={(e) => onChange(photos.map((p, j) => (j === i ? { ...p, caption: e.target.value } : p)))}
                placeholder="Caption (optional)"
                maxLength={60}
                className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-brand/60"
              />
            )}
          </div>
        ))}

        {room > 0 && (
          <button
            type="button"
            onClick={() => addRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
            }}
            disabled={uploading > 0}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border bg-surface-container-low/50 p-4 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer ${
              isSquare ? "aspect-square" : "min-h-[180px]"
            }`}
          >
            <span className={`material-symbols-outlined text-2xl ${uploading ? "animate-spin" : ""}`}>
              {uploading ? "progress_activity" : "add_photo_alternate"}
            </span>
            {uploading ? "Cropping & uploading…" : `Add ${noun}s`}
            <span className="text-[10px] opacity-70">Click or drop files · {room} left</span>
          </button>
        )}
      </div>

      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) addFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && replaceTarget.current !== null) replaceAt(replaceTarget.current, file);
          e.target.value = "";
        }}
      />

      {room > 0 && (
        <div className="flex gap-2 items-end max-w-xl">
          <Input label="Or add by image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://…" />
          <Button
            type="button"
            variant="outline"
            disabled={!/^(https?:\/\/|\/)/.test(urlInput.trim())}
            onClick={() => {
              onChange([...photos, { url: urlInput.trim(), caption: "" }]);
              setUrlInput("");
            }}
          >
            Add
          </Button>
        </div>
      )}
    </div>
  );
}

export function PhotosTab({ settings, loadData }: { settings: Record<string, string>; loadData: () => Promise<void> }) {
  const initial = useMemo(
    () => ({
      avatars: splitLines(settings.avatar_urls ?? SITE_SETTING_DEFAULTS.avatar_urls).map((url) => ({ url, caption: "" })),
      gallery: parseGallery(settings.gallery ?? SITE_SETTING_DEFAULTS.gallery),
      galleryTitle: settings.gallery_title ?? SITE_SETTING_DEFAULTS.gallery_title,
      gallerySubtitle: settings.gallery_subtitle ?? SITE_SETTING_DEFAULTS.gallery_subtitle,
    }),
    [settings]
  );

  const [avatars, setAvatars] = useState<Photo[]>(initial.avatars);
  const [gallery, setGallery] = useState<Photo[]>(initial.gallery);
  const [galleryTitle, setGalleryTitle] = useState(initial.galleryTitle);
  const [gallerySubtitle, setGallerySubtitle] = useState(initial.gallerySubtitle);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const values = {
    avatar_urls: avatars.map((a) => a.url).join("\n"),
    gallery: serializeGallery(gallery),
    gallery_title: galleryTitle,
    gallery_subtitle: gallerySubtitle,
  };
  const before = {
    avatar_urls: initial.avatars.map((a) => a.url).join("\n"),
    gallery: serializeGallery(initial.gallery),
    gallery_title: initial.galleryTitle,
    gallery_subtitle: initial.gallerySubtitle,
  };
  const dirty = (Object.keys(values) as (keyof typeof values)[]).filter((k) => values[k] !== before[k]);
  const usingStock = gallery.some((p) => p.url.startsWith("/gallery/"));

  const save = async () => {
    setSaving(true);
    setStatus("");
    try {
      const payload = Object.fromEntries(dirty.map((k) => [k, values[k]]));
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values: payload }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      setStatus("Saved. The live site is updated.");
      await loadData();
    } catch (err: any) {
      setStatus("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <Card interactive={false} className="p-6 md:p-8 space-y-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-title-md text-title-md flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            Profile photos
          </h3>
          <p className="text-xs text-on-surface-variant">
            Photos of you, shown in the hero and footer. The first one is the main photo (use ★ to make any photo the main
            one). With more than one, visitors see &ldquo;click me&rdquo; and clicking your photo cycles through them. Up to{" "}
            {AVATAR_LIMIT}; square photos look best. Delete them all to hide the photo.
          </p>
        </div>
        <PhotoGrid photos={avatars} onChange={setAvatars} limit={AVATAR_LIMIT} withCaptions={false} aspect="square" noun="profile photo" />
      </Card>

      <Card interactive={false} className="p-6 md:p-8 space-y-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-title-md text-title-md flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">landscape</span>
            &ldquo;Touching grass&rdquo; gallery (About page)
          </h3>
          <p className="text-xs text-on-surface-variant">
            Trips, hobbies, life outside work. Shown as the tilted, swipeable photo carousel. {GALLERY_RECOMMENDED} photos
            works best (up to {GALLERY_LIMIT}). Landscape photos look best. Remove all photos to hide the section.
          </p>
          {usingStock && (
            <p className="mt-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
              Some photos are the stock placeholders. Remove them and upload your own.
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Section title" value={galleryTitle} onChange={(e) => setGalleryTitle(e.target.value)} />
          <Input label="Section subtitle" value={gallerySubtitle} onChange={(e) => setGallerySubtitle(e.target.value)} />
        </div>
        <PhotoGrid photos={gallery} onChange={setGallery} limit={GALLERY_LIMIT} withCaptions aspect="wide" noun="gallery photo" />
      </Card>

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 md:left-[calc(50%+7.5rem)] z-40 flex items-center gap-4 rounded-xl border border-border bg-background/95 backdrop-blur px-4 py-3 shadow-lg">
        <span className="text-xs text-on-surface-variant">
          {status || (dirty.length ? `${dirty.length} unsaved change${dirty.length === 1 ? "" : "s"}` : "All changes saved")}
        </span>
        <Button
          variant="outline"
          disabled={dirty.length === 0 || saving}
          onClick={() => {
            setAvatars(initial.avatars);
            setGallery(initial.gallery);
            setGalleryTitle(initial.galleryTitle);
            setGallerySubtitle(initial.gallerySubtitle);
          }}
          className="h-9 text-xs"
        >
          Reset
        </Button>
        <Button variant="primary" disabled={dirty.length === 0 || saving} onClick={save} className="h-9 text-xs">
          {saving ? "Saving…" : "Save photos"}
        </Button>
      </div>
    </div>
  );
}
