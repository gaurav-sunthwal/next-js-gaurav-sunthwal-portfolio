"use client";

import { useState } from "react";
import { youtubeThumb } from "@/lib/youtube";
import { prioritizeSession, track } from "@/lib/analytics";

/**
 * Shows the video thumbnail with a play button and only loads YouTube's
 * player when clicked, so project pages stay fast.
 */
export function YouTubeEmbed({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setPlaying(true);
            track("youtube_play", { video: title });
            prioritizeSession("youtube_play");
          }}
          data-sfx="tap"
          aria-label={`Play video: ${title}`}
          className="group absolute inset-0 size-full cursor-pointer"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
            onError={(e) => {
              // Not every video has a max-res thumbnail; fall back to the standard one.
              if (!e.currentTarget.src.includes("hqdefault")) e.currentTarget.src = youtubeThumb(id);
            }}
            alt=""
            className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <span className="absolute left-1/2 top-1/2 flex h-12 w-[68px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl bg-[#ff0033] shadow-xl transition-transform duration-200 group-hover:scale-110">
            <svg viewBox="0 0 24 24" className="ml-0.5 size-6 fill-white" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
          <span className="absolute bottom-3 left-4 right-4 truncate text-left text-sm font-medium text-white drop-shadow">
            {title}
          </span>
        </button>
      )}
    </div>
  );
}
