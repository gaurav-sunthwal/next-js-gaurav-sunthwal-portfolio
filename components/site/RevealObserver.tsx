"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Plays each `.blur-in` entrance animation when the element scrolls into
 * view (instead of all at once on page load). Without JavaScript everything
 * simply shows, because the pause only applies once <html> has `reveal-ready`.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" }
    );
    const watch = () =>
      document.querySelectorAll(".blur-in:not(.in-view)").forEach((el) => observer.observe(el));

    watch();
    root.classList.add("reveal-ready");
    const mutations = new MutationObserver(watch);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return null;
}
