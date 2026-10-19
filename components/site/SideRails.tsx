import { CalendarDays } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { GithubIcon, LinkedinIcon, XIcon, YoutubeIcon } from "./brand-icons";

/** Fixed social links (left) and email (right), shown on wide screens only. */
export function SideRails({ settings }: { settings: SiteSettings }) {
  const socials = [
    { label: "GitHub", href: settings.social_github, Icon: GithubIcon },
    { label: "LinkedIn", href: settings.social_linkedin, Icon: LinkedinIcon },
    { label: "X", href: settings.social_x, Icon: XIcon },
    { label: "YouTube", href: settings.social_youtube, Icon: YoutubeIcon },
  ].filter((s) => s.href);

  const link =
    "flex size-8 items-center justify-center rounded-md text-muted-foreground/70 transition-[color,translate] duration-200 hover:-translate-y-0.5 hover:text-foreground motion-reduce:hover:translate-y-0";

  return (
    <>
      <nav
        aria-label="Social links"
        className="side-rail fixed bottom-0 z-20 hidden flex-col items-center gap-5 xl:flex"
        style={{ left: "calc((50vw - 27.5rem) / 2)", translate: "-50%" }}
      >
        <ul className="flex flex-col items-center gap-1.5">
          {socials.map(({ label, href, Icon }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} data-tooltip={label} data-tooltip-side="right" data-sfx-hover="tick" className={link}>
                <Icon />
              </a>
            </li>
          ))}
          {settings.booking_url && (
            <>
              <li aria-hidden="true" className="my-1.5 h-px w-4 bg-border" />
              <li>
                <a
                  href={settings.booking_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Book a call"
                  data-sfx="tap"
                  data-sfx-hover="tick"
                  data-tooltip="Book a call"
                  data-tooltip-side="right"
                  className={`${link} border border-border bg-background text-foreground/80 shadow-xs hover:border-brand/50 hover:text-brand`}
                >
                  <CalendarDays className="size-4" />
                </a>
              </li>
            </>
          )}
        </ul>
        <span aria-hidden="true" className="h-20 w-px bg-border" />
      </nav>

      {settings.email && (
        <div
          className="side-rail fixed bottom-0 z-20 hidden flex-col items-center gap-5 xl:flex"
          style={{ right: "calc((50vw - 27.5rem) / 2)", translate: "50%" }}
        >
          <a
            href={`mailto:${settings.email}`}
            className="font-mono text-[11px] lowercase tracking-[0.18em] text-muted-foreground/70 transition-[color,translate] duration-200 [writing-mode:vertical-rl] hover:-translate-y-0.5 hover:text-foreground"
          >
            {settings.email}
          </a>
          <span aria-hidden="true" className="h-20 w-px bg-border" />
        </div>
      )}
    </>
  );
}
