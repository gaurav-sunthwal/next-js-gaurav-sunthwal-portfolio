"use client";

import { Moon, Sun } from "lucide-react";
import { setTag, track } from "@/lib/analytics";

export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    track("theme_toggle", { to: next });
    setTag("theme", next);
    const apply = () => {
      root.classList.toggle("dark", next === "dark");
      try {
        localStorage.setItem("theme", next);
      } catch {}
    };
    // Smooth cross-fade where the browser supports view transitions
    const doc = document as Document & { startViewTransition?: (cb: () => void) => void };
    if (doc.startViewTransition && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      doc.startViewTransition(apply);
    } else {
      apply();
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      data-sfx="toggle"
      data-tooltip="Toggle theme"
      data-tooltip-side="bottom"
      className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Sun className="size-4 dark:hidden" />
      <Moon className="hidden size-4 dark:block" />
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

/** Inline script that sets the theme class before first paint (no flash). */
export const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;var r=document.documentElement;r.classList.toggle("dark",d);var f=localStorage.getItem("design-font"),a=localStorage.getItem("design-accent");if(f)r.dataset.font=f;if(a)r.dataset.accent=a;if("IntersectionObserver"in window)r.classList.add("reveal-ready")}catch(e){}})();`;
