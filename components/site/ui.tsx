import type { CSSProperties, ReactNode } from "react";
import { techIcon } from "@/lib/tech-icons";

/** Blur-and-fade entrance, staggered with `delay` (ms). */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <div className={`blur-in ${className}`} style={{ "--delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}

/** Full-bleed striped band between sections. */
export function Divider() {
  return <div aria-hidden="true" className="stripes -mx-6 h-5 border-y border-border bg-canvas" />;
}

export function SectionTitle({ children, subtitle }: { children: ReactNode; subtitle?: ReactNode }) {
  return (
    <div className="flex flex-col gap-y-1">
      <h2 className="font-space text-xl font-medium tracking-tight">
        {children}
        <span className="text-brand">.</span>
      </h2>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}

export function TechIcon({ name, icon, className = "size-3.5" }: { name: string; icon?: string | null; className?: string }) {
  const resolved = techIcon(name, icon);
  if (!resolved) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolved.src}
      alt=""
      loading="lazy"
      className={`${className} flex-none object-contain ${resolved.invert ? "dark:invert" : ""}`}
    />
  );
}

export function TechChip({ name, icon, note }: { name: string; icon?: string | null; note?: number }) {
  return (
    <span data-sfx-note={note} className="group flex h-7 w-fit flex-none cursor-default items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 transition-[border-color,translate] duration-200 hover:-translate-y-0.5 hover:border-brand/50">
      <TechIcon name={name} icon={icon} />
      <span className="whitespace-nowrap text-[11px] text-muted-foreground transition-colors group-hover:text-brand">
        {name}
      </span>
    </span>
  );
}

export function isVideo(url: string) {
  const u = url.toLowerCase();
  return [".mp4", ".mov", ".webm", ".ogg", ".m4v"].some((ext) => u.split("?")[0].endsWith(ext));
}
