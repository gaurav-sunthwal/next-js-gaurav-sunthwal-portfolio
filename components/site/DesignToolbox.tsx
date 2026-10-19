"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { setTag, track } from "@/lib/analytics";

const FONTS = [
  { id: "sans", label: "Sans" },
  { id: "mono", label: "Mono" },
] as const;

const ACCENTS = [
  { id: "blue", label: "Blue", swatch: "bg-[#3080ff]" },
  { id: "emerald", label: "Emerald", swatch: "bg-[#00bb7f]" },
  { id: "violet", label: "Violet", swatch: "bg-[#8d54ff]" },
  { id: "orange", label: "Orange", swatch: "bg-[#fe6e00]" },
] as const;

function apply(key: "font" | "accent", value: string, fallback: string) {
  const root = document.documentElement;
  try {
    if (value === fallback) {
      delete root.dataset[key];
      localStorage.removeItem(`design-${key}`);
    } else {
      root.dataset[key] = value;
      localStorage.setItem(`design-${key}`, value);
    }
  } catch {}
}

/**
 * A word in the bio (written as ~~word~~ in the admin). Hovering it opens a
 * tiny toolbox that lets visitors switch the site font and accent colour.
 */
export function DesignToolbox({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [font, setFont] = useState("sans");
  const [accent, setAccent] = useState("blue");
  const [left, setLeft] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = () => {
    clearTimeout(timer.current);
    if (open || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const width = 164;
    setLeft(Math.max(12, Math.min(r.left + r.width / 2 - width / 2, document.documentElement.clientWidth - width - 12)) - r.left);
    setFont(document.documentElement.dataset.font ?? "sans");
    setAccent(document.documentElement.dataset.accent ?? "blue");
    setOpen(true);
    track("design_toolbox_open");
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <span
      ref={ref}
      data-sfx-hover="whisper"
      className="relative inline-block"
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return;
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setOpen(false), 150);
      }}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOpen(false)}
    >
      <button
        type="button"
        onClick={show}
        onFocus={show}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="scribble cursor-pointer rounded-sm text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {children}
      </button>
      {open && (
        <span
          role="dialog"
          aria-label="Design options"
          style={{ left, width: 164 }}
          className="pop-in absolute bottom-full z-50 pb-2"
        >
          <span className="flex h-8 items-center justify-between rounded-full border border-border bg-background px-1.5 font-sans shadow-md">
            <span className="flex items-center">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-label={`${f.label} font`}
                  aria-pressed={font === f.id}
                  onClick={() => {
                    setFont(f.id);
                    apply("font", f.id, "sans");
                    track("design_font", { font: f.id });
                    setTag("font", f.id);
                  }}
                  className={`h-6 w-7 cursor-pointer rounded-full text-[11px] leading-none transition-colors ${
                    f.id === "mono" ? "font-mono" : ""
                  } ${font === f.id ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  Aa
                </button>
              ))}
            </span>
            <span aria-hidden="true" className="h-3.5 w-px bg-border" />
            <span className="flex items-center gap-1.5 pr-1">
              {ACCENTS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  aria-label={`${a.label} accent`}
                  aria-pressed={accent === a.id}
                  onClick={() => {
                    setAccent(a.id);
                    apply("accent", a.id, "blue");
                    track("design_accent", { accent: a.id });
                    setTag("accent", a.id);
                  }}
                  className={`size-3.5 cursor-pointer rounded-full ring-offset-1 ring-offset-background transition-shadow ${a.swatch} ${
                    accent === a.id ? "ring-1 ring-foreground/60" : "hover:ring-1 hover:ring-border"
                  }`}
                />
              ))}
            </span>
          </span>
        </span>
      )}
    </span>
  );
}
