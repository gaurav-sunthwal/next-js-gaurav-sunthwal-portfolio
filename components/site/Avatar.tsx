"use client";

import { useState } from "react";

/** Profile photo; when several photos are set in the admin, clicking cycles through them. */
export function Avatar({ urls, name }: { urls: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [clicked, setClicked] = useState(false);
  const multiple = urls.length > 1;
  if (urls.length === 0) return null;

  return (
    <div className="relative shrink-0">
      {multiple && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-full left-1/2 mb-1.5 flex -translate-x-1/2 items-end gap-1 whitespace-nowrap font-mono text-[10px] leading-none text-muted-foreground/60 transition-opacity duration-500 ${
            clicked ? "opacity-0" : ""
          }`}
        >
          click me
          <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="size-3 translate-y-0.5">
            <path d="M2 2c5 0 8 3 8 10" />
            <path d="M6.5 8.5 10 12.5 13 8" />
          </svg>
        </div>
      )}
      <button
        type="button"
        disabled={!multiple}
        data-sfx={multiple ? "pop" : undefined}
        onClick={() => {
          setClicked(true);
          setIndex((i) => (i + 1) % urls.length);
        }}
        aria-label={multiple ? `Photo of ${name}. Show another photo` : `Photo of ${name}`}
        className="relative block size-16 overflow-hidden rounded-2xl border shadow-lg ring-4 ring-muted transition-transform duration-200 enabled:cursor-pointer enabled:hover:scale-[1.03] enabled:active:scale-95 sm:size-20 md:size-24 motion-reduce:transition-none"
      >
        {urls.map((url, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={url + i}
            src={url}
            alt=""
            width={96}
            height={96}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-300 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      </button>
    </div>
  );
}
