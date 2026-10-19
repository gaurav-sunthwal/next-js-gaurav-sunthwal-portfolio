"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { play } from "./Sounds";

export type Photo = { src: string; caption: string };

/**
 * Tilted photo carousel: the centre photo sits straight, its neighbours lean
 * away. Drag, swipe, click a side photo, or use the arrow keys/buttons.
 */
export function PhotoCarousel({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0);
  const start = useRef<number | null>(null);
  const n = photos.length;
  if (n === 0) return null;

  const go = (dir: number) => {
    setIndex((i) => (i + dir + n) % n);
    play("soft");
  };

  // Shortest signed distance from the active photo, so the loop wraps nicely.
  const offset = (i: number) => {
    let d = i - index;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Photos"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1);
          if (e.key === "ArrowRight") go(1);
        }}
        onPointerDown={(e) => {
          start.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        }}
        onPointerCancel={() => (start.current = null)}
        className="relative -mx-6 h-[300px] cursor-grab touch-pan-y select-none overflow-hidden focus-visible:outline-none active:cursor-grabbing sm:h-[340px]"
      >
        {photos.map((photo, i) => {
          const d = offset(i);
          const visible = Math.abs(d) <= 1;
          return (
            <figure
              key={photo.src + i}
              onClick={() => d !== 0 && go(d)}
              aria-hidden={d !== 0}
              className="absolute left-1/2 top-4 flex w-[62%] max-w-[370px] flex-col items-center gap-3 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
              style={{
                transform: `translateX(calc(-50% + ${d * 118}%)) rotate(${d * 9}deg) translateY(${Math.abs(d) * 18}px)`,
                opacity: visible ? 1 : 0,
                zIndex: 10 - Math.abs(d),
                pointerEvents: visible ? "auto" : "none",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.caption}
                draggable={false}
                loading={visible ? "eager" : "lazy"}
                className="aspect-[16/10] w-full rounded-2xl object-cover shadow-lg"
              />
              <figcaption className="text-center text-base text-muted-foreground">{photo.caption}</figcaption>
            </figure>
          );
        })}
      </div>
      {n > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous photo"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {index + 1} / {n}
          </span>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next photo"
            className="flex size-8 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
}
