"use client";

import { useState, type ReactNode } from "react";
import { FloatingPortal, useHoverPopup } from "./Floating";

const W = 200;
const H = 125;

function screenshotUrl(url: string) {
  const dark = document.documentElement.classList.contains("dark");
  const params = new URLSearchParams({
    url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
    colorScheme: dark ? "dark" : "light",
    "viewport.isMobile": "true",
    "viewport.deviceScaleFactor": "1",
    "viewport.width": String(W * 3),
    "viewport.height": String(H * 3),
  });
  return `https://api.microlink.io/?${params}`;
}

/**
 * External link that shows a live screenshot of the target site on hover.
 * The preview springs in and drifts with the mouse, like the reference site.
 * Pass `image` to use a fixed picture instead of a live screenshot.
 */
export function LinkPreview({
  href,
  children,
  className = "font-medium text-foreground underline underline-offset-2",
  image,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  image?: string;
}) {
  const { open, rect, triggerRef, triggerProps, popupProps } = useHoverPopup({ openDelay: 50, closeDelay: 100 });
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [drift, setDrift] = useState(0);

  return (
    <>
      <a
        ref={(el) => {
          triggerRef.current = el;
        }}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        data-sfx-hover="whisper"
        {...triggerProps}
        onPointerEnter={(e) => {
          // Only start fetching the screenshot once someone actually hovers.
          if (!src && e.pointerType === "mouse") setSrc(image || screenshotUrl(href));
          triggerProps.onPointerEnter(e);
        }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setDrift((e.clientX - r.left - r.width / 2) / 2);
        }}
      >
        {children}
      </a>
      {src && rect && (
        <FloatingPortal rect={rect} width={W + 12} height={H + 12} offsetX={drift}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={-1}
            aria-hidden="true"
            {...popupProps}
            className={`block rounded-xl border-2 border-transparent bg-white p-1 shadow-xl transition-[opacity,transform,border-color] hover:border-neutral-200 dark:bg-neutral-900 dark:hover:border-neutral-800 ${
              open
                ? "pointer-events-auto translate-y-0 scale-100 opacity-100 duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                : "pointer-events-none translate-y-5 scale-[0.6] opacity-0 duration-150 ease-in"
            }`}
            style={{ fontSize: 0, transformOrigin: "bottom center" }}
          >
            <span className="relative block overflow-hidden rounded-lg bg-muted" style={{ width: W, height: H }}>
              {!loaded && <span className="absolute inset-0 animate-pulse bg-muted" />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                width={W}
                height={H}
                alt=""
                onLoad={() => setLoaded(true)}
                className={`size-full object-cover object-top transition-opacity duration-200 ${loaded ? "opacity-100" : "opacity-0"}`}
              />
            </span>
          </a>
        </FloatingPortal>
      )}
    </>
  );
}
