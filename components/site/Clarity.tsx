"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { prioritizeSession, setTag, track } from "@/lib/analytics";

const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_ID || "z05qrhmpdh";

// Local visits aren't recorded: Clarity's replay page (https) can't load styles
// from http://localhost, so those recordings would always look unstyled.
// Set NEXT_PUBLIC_CLARITY_LOCAL=true to record locally anyway.
const isLocalHost = (host: string) => host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");

/** Which kind of page this is, so sessions can be filtered in Clarity. */
function pageType(path: string) {
  if (path === "/") return "home";
  if (path.startsWith("/projects/")) return "project";
  return path.split("/")[1] || "home";
}

/**
 * Microsoft Clarity: session recordings, heatmaps, rage/dead clicks and scroll
 * depth are recorded automatically. On top of that, this reports named events
 * for the things that matter on this site (see the `track()` calls).
 *
 * Any element can also report a click by itself with data attributes:
 *   <a data-track="resume_download" data-track-label="footer">
 */
export function Clarity() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(process.env.NEXT_PUBLIC_CLARITY_LOCAL === "true" || !isLocalHost(window.location.hostname));
  }, []);

  // Tag every page view so sessions can be filtered by page and project.
  useEffect(() => {
    setTag("page", pathname);
    setTag("page_type", pageType(pathname));
    if (pathname.startsWith("/projects/")) setTag("project", pathname.split("/")[2]);
    track("page_view", { last_page: pathname });
  }, [pathname]);

  useEffect(() => {
    // Theme and visitor settings at the start of the visit.
    const root = document.documentElement;
    setTag("theme", root.classList.contains("dark") ? "dark" : "light");
    setTag("accent", root.dataset.accent || "blue");
    setTag("font", root.dataset.font || "sans");

    // One listener for every click on the site.
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest?.("a, button, [data-track]") as HTMLElement | null;
      if (!el) return;

      // 1) Explicitly labelled elements.
      const explicit = el.closest("[data-track]") as HTMLElement | null;
      if (explicit?.dataset.track) {
        track(explicit.dataset.track, { label: explicit.dataset.trackLabel || explicit.textContent?.trim() });
        return;
      }

      // 2) Links, recognised by where they go.
      if (el instanceof HTMLAnchorElement && el.href) {
        const href = el.getAttribute("href") || "";
        const text = (el.getAttribute("aria-label") || el.textContent || "").trim();
        if (href.startsWith("mailto:")) return track("email_click", { label: text });
        if (/\.pdf($|\?)/i.test(href) || /resume|cv/i.test(text)) return track("resume_download", { label: text });

        let url: URL;
        try {
          url = new URL(el.href);
        } catch {
          return;
        }
        if (url.origin !== window.location.origin) {
          const host = url.hostname.replace(/^www\./, "");
          const social = ["github.com", "linkedin.com", "x.com", "twitter.com", "youtube.com", "cal.com", "calendly.com"].find(
            (s) => host === s || host.endsWith("." + s)
          );
          return track(social ? "social_click" : "outbound_click", { destination: social || host, label: text });
        }
        if (url.pathname.startsWith("/projects/")) {
          return track("project_open", { project: url.pathname.split("/")[2], label: text, from: window.location.pathname });
        }
        return track("nav_click", { to: url.pathname + url.hash, label: text });
      }

      // 3) Buttons with a recognisable purpose.
      const label = (el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim();
      if (label) track("button_click", { label });
    };

    // How far people scroll on each page (25/50/75/100%).
    const reached = new Set<string>();
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      const pct = (window.scrollY / max) * 100;
      for (const mark of [25, 50, 75, 100]) {
        const id = `${window.location.pathname}:${mark}`;
        if (pct >= mark - 1 && !reached.has(id)) {
          reached.add(id);
          track(`scroll_${mark}`, { page: window.location.pathname });
        }
      }
    };

    // Long visits are worth keeping in full.
    const engaged = window.setTimeout(() => prioritizeSession("engaged_60s"), 60_000);

    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(engaged);
    };
  }, []);

  if (!enabled) return null;
  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_ID}");`}
    </Script>
  );
}
