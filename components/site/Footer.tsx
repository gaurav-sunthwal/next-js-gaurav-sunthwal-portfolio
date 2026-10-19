import Link from "next/link";
import type { SiteSettings } from "@/lib/site-settings";
import { splitLines } from "@/lib/site-settings";

export function Footer({ settings }: { settings: SiteSettings }) {
  const avatar = splitLines(settings.avatar_urls)[0];
  const connect = [
    { label: "GitHub", href: settings.social_github },
    { label: "LinkedIn", href: settings.social_linkedin },
    { label: "X / Twitter", href: settings.social_x },
    { label: "YouTube", href: settings.social_youtube },
    { label: "Book a call", href: settings.booking_url },
    { label: "Resume", href: settings.resume_url },
  ].filter((l) => l.href);

  const explore = [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Projects", href: "/projects" },
    { label: "Memories", href: "/memories" },
    { label: "Experience", href: "/#work" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <footer className="mb-4 mt-10">
      <div aria-hidden="true" className="h-px w-full bg-linear-to-r from-transparent via-border to-transparent" />
      <div className="px-1 pt-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
          <div className="col-span-2 flex flex-col gap-4 sm:col-span-1">
            <div className="flex items-center gap-3">
              {avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt={settings.name}
                  className="size-11 rounded-lg border border-border/60 object-cover shadow-sm"
                />
              )}
              <div className="flex flex-col leading-tight">
                <span className="font-space text-sm font-medium text-foreground">{settings.name}</span>
                <span className="text-xs text-muted-foreground">{settings.tagline}</span>
              </div>
            </div>
            <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">{settings.footer_note}</p>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">Explore</p>
            <ul className="flex flex-col gap-2">
              {explore.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">Connect</p>
            <ul className="flex flex-col gap-2">
              {connect.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-2 border-t border-border/40 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {settings.name}. All rights reserved.
          </p>
          {settings.github_username && (
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
              {settings.github_username}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
