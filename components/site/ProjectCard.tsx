import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Project } from "@/lib/content";
import { techIcon } from "@/lib/tech-icons";
import { isVideo } from "./ui";
import { youtubeId } from "@/lib/youtube";

import type { ProjectMini } from "./ProjectHoverCard";

const BACKDROP_COUNT = 10;

/** Lookup used so [Name](/projects/id) links can show a project card on hover. */
export function projectMiniMap(projects: Project[]): Record<string, ProjectMini> {
  return Object.fromEntries(
    projects.map((p) => [p.id, { id: p.id, title: p.title, description: p.description, image: projectPreview(p), logo: p.image }])
  );
}

export function projectPreview(project: Project) {
  const media = [...(project.screenshots ?? []), project.image].filter(Boolean);
  return media.find((m) => !isVideo(m)) ?? media[0] ?? "";
}

/** Same landscape photo for a project every time (picked from its id). */
export function projectBackdrop(id: string) {
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return `/backdrops/b${(hash % BACKDROP_COUNT) + 1}.jpg`;
}

export function ProjectCard({ project }: { project: Project }) {
  const preview = projectPreview(project);
  const icons = project.tags
    .map((tag) => ({ tag, icon: techIcon(tag) }))
    .filter((x) => x.icon)
    .slice(0, 4);
  const isApp = project.type === "app";

  return (
    <Link
      href={`/projects/${project.id}`}
      data-sfx="tap"
      data-sfx-hover="hover"
      className="group flex min-w-0 flex-col gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
    >
      <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-border bg-canvas">
        <div
          aria-hidden="true"
          className="stripes absolute inset-0 mask-[radial-gradient(ellipse_at_center,transparent_25%,black_95%)]"
        />
        {/* Landscape photo that fades in behind the screenshot on hover */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={projectBackdrop(project.id)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 size-full scale-110 object-cover opacity-0 blur-[3px] transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
        />
        {preview && (
          <div className={`absolute inset-0 flex items-center justify-center ${isApp ? "p-4" : "p-5"}`}>
            {isVideo(preview) ? (
              <video
                src={preview}
                muted
                loop
                playsInline
                autoPlay
                className="h-auto max-h-full w-full rounded-md border border-border object-contain shadow-lg transition-transform duration-300 ease-out group-hover:-translate-y-1"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={`${project.title} screenshot`}
                loading="lazy"
                className="h-auto max-h-full w-auto max-w-full rounded-md border border-border object-contain shadow-lg transition-transform duration-300 ease-out group-hover:-translate-y-1 group-focus-visible:-translate-y-1 motion-reduce:transition-none"
              />
            )}
          </div>
        )}
        {youtubeId(project.youtubeUrl) && (
          <span className="absolute left-3 top-3 flex h-6 items-center gap-1 rounded-md border border-border bg-background/90 px-1.5 text-[10px] font-medium text-foreground backdrop-blur-sm">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3 fill-[#ff0033]">
              <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.55 15.57V8.43L15.82 12l-6.27 3.57Z" />
            </svg>
            Video
          </span>
        )}
        {icons.length > 0 && (
          <span className="absolute bottom-3 right-3 flex h-6 items-center gap-1.5 rounded-md border border-border bg-background/90 px-1.5 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
            {icons.map(({ tag, icon }) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={tag} src={icon!.src} alt={tag} data-tooltip={tag} className={`size-3.5 ${icon!.invert ? "dark:invert" : ""}`} />
            ))}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1 px-0.5">
        <span className="flex items-center gap-2">
          {project.image && !isVideo(project.image) && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.image} alt="" className="size-5 flex-none rounded-md border border-border object-cover" />
          )}
          <span className="font-space text-base font-medium leading-snug tracking-tight transition-colors group-hover:text-brand group-focus-visible:text-brand">
            {project.title}
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground/80">
          <span className="min-w-0 truncate">{project.description}</span>
          <ChevronRight className="size-3.5 flex-none transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
