import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Globe, Smartphone } from "lucide-react";
import { getProject, getProjects } from "@/lib/content";
import { Reveal, TechChip, isVideo } from "@/components/site/ui";
import { projectBackdrop, projectPreview } from "@/components/site/ProjectCard";
import { GithubIcon, YoutubeIcon } from "@/components/site/brand-icons";
import { YouTubeEmbed } from "@/components/site/YouTubeEmbed";
import { youtubeId, youtubeWatchUrl } from "@/lib/youtube";

export const revalidate = 300;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) return { title: "Project not found" };
  const image = projectPreview(project);
  return {
    title: project.title,
    description: project.description,
    alternates: { canonical: `/projects/${project.id}` },
    openGraph: { title: project.title, description: project.description, images: image && !isVideo(image) ? [image] : [] },
  };
}

type Project = NonNullable<Awaited<ReturnType<typeof getProject>>>;

function linkButtons(project: Project, videoId: string | null) {
  const links = (project.links ?? []).filter((l) => l.href && l.href !== "#");
  if (videoId && !links.some((l) => /youtu/.test(l.href))) {
    links.push({ label: "View on YouTube", href: youtubeWatchUrl(videoId), icon: "smart_display" });
  }
  if (project.demoUrl && project.demoUrl !== "#" && !links.some((l) => l.href === project.demoUrl)) {
    links.push({ label: "Visit Site", href: project.demoUrl, icon: "open_in_new" });
  }
  return links.map((l) => {
    const text = (l.label + " " + l.href).toLowerCase();
    if (/github|source|code/.test(text)) return { ...l, label: "View on GitHub", Icon: GithubIcon };
    if (/youtube|youtu\.be/.test(text)) return { ...l, label: "View on YouTube", Icon: YoutubeIcon };
    if (/play\.google|apps\.apple|app store|play store/.test(text)) return { ...l, Icon: Smartphone };
    if (/demo|live|site|view/.test(text)) return { ...l, label: "Visit Site", Icon: Globe };
    return { ...l, Icon: Globe };
  });
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const videoId = youtubeId(project.youtubeUrl);
  const buttons = linkButtons(project, videoId);
  const media = Array.from(new Set([...(project.screenshots ?? []), project.image].filter(Boolean)));
  const isApp = project.type === "app";
  // With a video, it takes the top spot and every screenshot goes to the gallery.
  const hero = videoId ? undefined : media[0];
  const galleryItems = videoId ? media : isApp ? media.slice(3) : media.slice(1);

  return (
    <article className="flex flex-col gap-6">
      <Reveal className="flex items-center gap-3">
        <Link
          href="/projects"
          aria-label="Back to projects"
          data-sfx="soft"
          data-tooltip="All projects"
          className="flex size-8 flex-none items-center justify-center rounded-lg border border-border bg-background text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-4" />
        </Link>
        {project.image && !isVideo(project.image) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.image} alt="" className="size-8 rounded-lg border border-border object-cover" />
        )}
        <h1 className="font-space text-xl font-medium tracking-tight sm:text-2xl">{project.title}</h1>
      </Reveal>

      <Reveal delay={60}>
        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>
      </Reveal>

      {videoId && (
        <Reveal delay={120}>
          <YouTubeEmbed id={videoId} title={project.title} />
        </Reveal>
      )}

      {/* Main media on a landscape backdrop */}
      {hero && (
        <Reveal delay={120}>
          <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-canvas">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={projectBackdrop(project.id)} alt="" aria-hidden="true" className="absolute inset-0 -z-10 size-full scale-110 object-cover blur-[3px]" />
            <div className={`flex items-center justify-center ${isApp ? "gap-3 p-6" : "p-4 sm:p-8"}`}>
              {(isApp ? media.slice(0, 3) : [hero]).map((src, i) =>
                isVideo(src) ? (
                  <video
                    key={src}
                    src={src}
                    controls
                    muted
                    playsInline
                    className={`rounded-lg border border-border shadow-2xl ${isApp ? "max-h-[420px] w-auto" : "w-full"}`}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={src}
                    src={src}
                    alt={`${project.title} screenshot ${i + 1}`}
                    className={`rounded-lg border border-border object-contain shadow-2xl ${
                      isApp ? `max-h-[420px] w-auto min-w-0 ${i > 0 ? "hidden sm:block" : ""}` : "w-full"
                    }`}
                  />
                )
              )}
            </div>
          </div>
        </Reveal>
      )}

      {buttons.length > 0 && (
        <Reveal delay={160} className="flex flex-wrap gap-2">
          {buttons.map(({ label, href, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              data-sfx="tap"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
            >
              <Icon className="size-4" />
              {label}
            </a>
          ))}
        </Reveal>
      )}

      {project.content && (
        <Reveal delay={200}>
          <div className="prose-content text-[15px] text-foreground/85">
            <ReactMarkdown>{project.content}</ReactMarkdown>
          </div>
        </Reveal>
      )}

      {project.tags.length > 0 && (
        <Reveal delay={240} className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Tech stack</h2>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, i) => (
              <TechChip key={tag} name={tag} note={i} />
            ))}
          </div>
        </Reveal>
      )}

      {/* Remaining screenshots */}
      {galleryItems.length > 0 && (
        <Reveal delay={280} className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Gallery</h2>
          <div className={isApp ? "-mx-6 flex snap-x gap-3 overflow-x-auto px-6 pb-2 scrollbar-none" : "grid grid-cols-1 gap-3 sm:grid-cols-2"}>
            {galleryItems.map((src, i) => (
              <div
                key={src}
                className={`stripes flex-none overflow-hidden rounded-xl border border-border bg-canvas ${isApp ? "w-[46%] snap-start p-2 sm:w-[31%]" : "p-3"}`}
              >
                {isVideo(src) ? (
                  <video src={src} controls muted playsInline className="w-full rounded-md border border-border" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt={`${project.title} screenshot ${i + 2}`} loading="lazy" className="w-full rounded-md border border-border object-contain" />
                )}
              </div>
            ))}
          </div>
        </Reveal>
      )}
    </article>
  );
}
