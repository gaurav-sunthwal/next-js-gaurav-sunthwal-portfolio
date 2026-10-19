import type { SiteSettings } from "@/lib/site-settings";
import { splitLines } from "@/lib/site-settings";
import { Avatar } from "./Avatar";
import { RichText } from "./RichText";
import type { ProjectMini } from "./ProjectHoverCard";
import { Reveal } from "./ui";

export function VerifiedBadge() {
  return (
    <span data-tooltip="Verified" className="inline-flex">
      <svg viewBox="0 0 24 24" aria-label="Verified" className="size-5 text-brand sm:size-6">
        <path
          fill="currentColor"
          d="M12 1.5l2.4 1.8 3-.2 1 2.8 2.6 1.6-.6 2.9 1.4 2.6-2 2.2-.1 3-2.9.7-1.6 2.5-2.9-.9L12 22.5l-2.3-1.9-2.9.9-1.6-2.5-2.9-.7-.1-3-2-2.2 1.4-2.6-.6-2.9 2.6-1.6 1-2.8 3 .2z"
        />
        <path d="M8 12.3l2.6 2.6L16.2 9.3" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Photo, name, tagline and bio. Shared by the home and about pages. */
export function Hero({ settings, projects }: { settings: SiteSettings; projects?: Record<string, ProjectMini> }) {
  const avatars = splitLines(settings.avatar_urls);
  return (
    <section id="hero" className="flex flex-col gap-8">
      <div className="flex flex-row items-center gap-6">
        {avatars.length > 0 && (
          <Reveal>
            <Avatar urls={avatars} name={settings.name} />
          </Reveal>
        )}
        <div className="flex flex-col gap-1">
          <Reveal delay={80} className="flex items-center gap-1.5">
            <h1 className="font-space text-xl font-medium tracking-tighter sm:text-3xl">{settings.name}</h1>
            {settings.show_verified !== "false" && <VerifiedBadge />}
          </Reveal>
          <Reveal delay={140}>
            <p className="text-sm tracking-tight text-muted-foreground sm:text-base">{settings.tagline}</p>
          </Reveal>
        </div>
      </div>
      <Reveal delay={200}>
        <p className="text-xs leading-snug text-muted-foreground sm:text-sm">
          <RichText text={settings.bio} projects={projects} />
        </p>
      </Reveal>
    </section>
  );
}
