"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { play } from "./Sounds";

export type MemoryPhoto = {
  id: number;
  url: string;
  caption: string;
  takenOn: string;
  width: number;
  height: number;
  kind?: string;
  poster?: string | null;
  duration?: number;
};

const formatDuration = (s?: number) => (s ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}` : "");

/** Video tile: shows the cover, plays a silent preview while hovered. */
function VideoTile({ photo, eager }: { photo: MemoryPhoto; eager: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <span
      className="block size-full"
      onMouseEnter={() => ref.current?.play().catch(() => {})}
      onMouseLeave={() => {
        if (ref.current) {
          ref.current.pause();
          ref.current.currentTime = 0;
        }
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {photo.poster && <img src={photo.poster} alt={photo.caption || "Video"} loading={eager ? "eager" : "lazy"} className="absolute inset-0 size-full object-cover" />}
      <video
        ref={ref}
        src={photo.url}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />
      <span className="pointer-events-none absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
        <svg viewBox="0 0 24 24" className="size-3 fill-white" aria-hidden="true">
          <path d="M8 5v14l11-7z" />
        </svg>
        {formatDuration(photo.duration)}
      </span>
    </span>
  );
}

// Columns per screen width: phones 2, tablets 3, laptops 4, big monitors 5.
const BREAKPOINTS: [number, number][] = [
  [1280, 5],
  [1024, 4],
  [640, 3],
  [0, 2],
];

function useColumnCount() {
  const [count, setCount] = useState(4);
  useEffect(() => {
    const update = () => setCount(BREAKPOINTS.find(([min]) => window.innerWidth >= min)![1]);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return count;
}

/**
 * Pinterest placement: each photo goes into whichever column is currently
 * shortest, so photos read left-to-right and the columns end almost level.
 * Heights are known up front from each photo's stored width/height.
 */
function layoutMasonry(photos: MemoryPhoto[], maxColumns: number) {
  // With only a few photos, use fewer columns (about 2–3 photos each) so the
  // columns stay balanced; big collections use every column the screen allows.
  const count = Math.max(2, Math.min(maxColumns, Math.round(photos.length / 2.5)));
  const columns: { photo: MemoryPhoto; index: number }[][] = Array.from({ length: count }, () => []);
  const heights = new Array(count).fill(0);
  photos.forEach((photo, index) => {
    const ratio = photo.width && photo.height ? photo.height / photo.width : 1.25;
    const shortest = heights.indexOf(Math.min(...heights));
    columns[shortest].push({ photo, index });
    heights[shortest] += ratio + 0.06; // + the gap between photos
  });
  return columns;
}

/** Pinterest-style masonry: photos keep their own shape and stack into columns. */
export function MemoriesGrid({ photos }: { photos: MemoryPhoto[] }) {
  const [filter, setFilter] = useState("All");
  const [open, setOpen] = useState<number | null>(null);

  // Filter chips come from the "place / date" label on each photo.
  const chips = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of photos) if (p.takenOn.trim()) counts.set(p.takenOn.trim(), (counts.get(p.takenOn.trim()) ?? 0) + 1);
    return ["All", ...[...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k)];
  }, [photos]);

  const visible = filter === "All" ? photos : photos.filter((p) => p.takenOn.trim() === filter);
  const columnCount = useColumnCount();
  const columns = useMemo(() => layoutMasonry(visible, columnCount), [visible, columnCount]);

  return (
    <div className="flex flex-col gap-6">
      {chips.length > 2 && (
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 scrollbar-none">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              data-sfx="soft"
              onClick={() => setFilter(chip)}
              className={`relative shrink-0 cursor-pointer whitespace-nowrap px-3 py-1.5 text-sm transition-colors ${
                filter === chip ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {chip}
              {filter === chip && <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-foreground" />}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-start gap-3 sm:gap-4">
        {columns.map((column, c) => (
          <div key={c} className="flex min-w-0 flex-1 flex-col gap-3 sm:gap-4">
            {column.map(({ photo, index }) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setOpen(index)}
                data-sfx="pop"
                data-sfx-hover="whisper"
                className="group relative block w-full cursor-zoom-in overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ aspectRatio: photo.width && photo.height ? `${photo.width} / ${photo.height}` : "4 / 5" }}
              >
                {photo.kind === "video" ? (
                  <VideoTile photo={photo} eager={index < 10} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={photo.caption || "Memory"}
                    loading={index < 10 ? "eager" : "lazy"}
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                )}
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {(photo.caption || photo.takenOn) && (
                  <span className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-1 flex-col items-start gap-0.5 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {photo.caption && <span className="text-sm font-medium leading-snug text-white drop-shadow">{photo.caption}</span>}
                    {photo.takenOn && <span className="text-[11px] text-white/80">{photo.takenOn}</span>}
                  </span>
                )}
              </button>
            ))}
          </div>
        ))}
      </div>

      {open !== null && <Lightbox photos={visible} index={open} onChange={setOpen} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: MemoryPhoto[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const n = photos.length;
  const photo = photos[index];
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (dir: number) => {
      onChange((index + dir + n) % n);
      play("soft");
    },
    [index, n, onChange]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [go, onClose]);

  // Preload the neighbours so next/previous feel instant.
  useEffect(() => {
    [photos[(index + 1) % n], photos[(index - 1 + n) % n]].forEach((p) => {
      if (p) new Image().src = p.kind === "video" ? p.poster || "" : p.url;
    });
  }, [index, n, photos]);

  if (!photo) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      className="fixed inset-0 z-[200] flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center justify-between px-4 py-3 text-white/80" onClick={(e) => e.stopPropagation()}>
        <span className="font-mono text-xs tabular-nums">
          {index + 1} / {n}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex size-9 cursor-pointer items-center justify-center rounded-full hover:bg-white/10"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-16">
        {photo.kind === "video" ? (
          <video
            key={photo.id}
            src={photo.url}
            poster={photo.poster || undefined}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            className="pop-in max-h-full max-w-full rounded-lg bg-black shadow-2xl"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.caption || "Memory"}
            onClick={(e) => e.stopPropagation()}
            className="pop-in max-h-full max-w-full rounded-lg object-contain shadow-2xl"
          />
        )}
        {n > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 hidden size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <div className="min-h-[64px] px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
        {photo.caption && <p className="text-sm font-medium text-white">{photo.caption}</p>}
        {photo.takenOn && <p className="mt-0.5 text-xs text-white/60">{photo.takenOn}</p>}
      </div>
    </div>,
    document.body
  );
}
