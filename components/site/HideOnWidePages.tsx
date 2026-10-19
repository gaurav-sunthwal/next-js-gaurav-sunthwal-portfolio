"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

// Pages that use the wide page frame (Pinterest-style grids).
const WIDE_PAGES = ["/memories"];

export function useIsWidePage() {
  const pathname = usePathname();
  return WIDE_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Width of the page frame: the normal reading column, or wide on gallery pages. */
export const frameWidth = (wide: boolean) => (wide ? "max-w-[1400px]" : "max-w-3xl");

/** Hides its children on wide pages (the fixed side rails would overlap the content). */
export function HideOnWidePages({ children }: { children: ReactNode }) {
  return useIsWidePage() ? null : <>{children}</>;
}

/** The page column. Widens on wide pages so header, content and footer stay aligned. */
export function SiteFrame({ children }: { children: ReactNode }) {
  const wide = useIsWidePage();
  return (
    <div
      className={`relative z-10 mx-auto min-h-screen bg-background px-6 pb-4 pt-24 transition-[max-width] duration-300 sm:pb-6 sm:pt-28 ${frameWidth(wide)}`}
    >
      {/* Striped rails either side of the column (only where the screen has room for them) */}
      <div
        aria-hidden="true"
        className={`stripes-rail pointer-events-none absolute inset-y-0 right-full hidden w-14 border-x border-border/70 ${wide ? "min-[1540px]:block" : "lg:block"}`}
      />
      <div
        aria-hidden="true"
        className={`stripes-rail pointer-events-none absolute inset-y-0 left-full hidden w-14 border-x border-border/70 ${wide ? "min-[1540px]:block" : "lg:block"}`}
      />
      {children}
    </div>
  );
}
