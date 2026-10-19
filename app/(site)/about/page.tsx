import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ComponentType } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowUpRight, Award, CalendarDays, FileText, Mail } from "lucide-react";
import { getCertifications, getEducation, getMemories, getProjects, getSettings, getStack } from "@/lib/content";
import { splitLines } from "@/lib/site-settings";
import { Hero } from "@/components/site/Hero";
import { projectMiniMap } from "@/components/site/ProjectCard";
import { PhotoCarousel } from "@/components/site/PhotoCarousel";
import { GithubActivity } from "@/components/site/GithubActivity";
import { GithubIcon, LinkedinIcon, XIcon, YoutubeIcon } from "@/components/site/brand-icons";
import { Divider, Reveal, SectionTitle, TechChip } from "@/components/site/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "About",
  description: "More about Gaurav Sunthwal: links, photos, skills, education and certifications.",
  alternates: { canonical: "/about" },
};

/** "https://github.com/gaurav-sunthwal" → "gaurav-sunthwal" */
function handle(url: string) {
  try {
    const u = new URL(url);
    const last = u.pathname.split("/").filter(Boolean).pop();
    return last ? decodeURIComponent(last) : u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

type LinkRow = { label: string; sub: string; href: string; Icon: ComponentType<{ className?: string }> };

export default async function AboutPage() {
  const [settings, education, certs, stack, projects, memories] = await Promise.all([
    getSettings(),
    getEducation(),
    getCertifications(),
    getStack(),
    getProjects(),
    getMemories(),
  ]);

  const links = [
    settings.social_github && { label: "GitHub", sub: handle(settings.social_github), href: settings.social_github, Icon: GithubIcon },
    settings.social_linkedin && { label: "LinkedIn", sub: handle(settings.social_linkedin), href: settings.social_linkedin, Icon: LinkedinIcon },
    settings.social_x && { label: "X", sub: "@" + handle(settings.social_x), href: settings.social_x, Icon: XIcon },
    settings.social_youtube && { label: "YouTube", sub: handle(settings.social_youtube), href: settings.social_youtube, Icon: YoutubeIcon },
    settings.email && { label: "Email", sub: settings.email, href: `mailto:${settings.email}`, Icon: Mail },
    settings.booking_url && { label: "Book a call", sub: settings.booking_url.replace(/^https?:\/\/(www\.)?/, ""), href: settings.booking_url, Icon: CalendarDays },
    settings.resume_url && { label: "Resume", sub: "Download PDF", href: settings.resume_url, Icon: FileText },
  ].filter(Boolean) as LinkRow[];

  const photos = splitLines(settings.gallery).map((line) => {
    const [src, caption] = line.split("|").map((s) => s.trim());
    return { src, caption: caption || "" };
  });

  return (
    <>
      <Hero settings={settings} projects={projectMiniMap(projects)} />

      {settings.about_long && (
        <Reveal delay={240}>
          <div className="prose-content">
            <ReactMarkdown>{settings.about_long}</ReactMarkdown>
          </div>
        </Reveal>
      )}

      {/* Social links grid */}
      {links.length > 0 && (
        <>
          <Divider />
          <section className="-mx-6 -my-8">
            <ul className="stripes grid grid-cols-1 gap-x-5 bg-canvas sm:grid-cols-2">
              {links.map(({ label, sub, href, Icon }, i) => (
                <li key={label} className="bg-background">
                  <Reveal delay={i * 40}>
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      data-sfx="tap"
                      data-sfx-hover="tick"
                      className="group flex items-center gap-3 border-b border-border px-6 py-3.5 transition-colors hover:bg-muted/40"
                    >
                      <span className="flex size-8 flex-none items-center justify-center rounded-lg border border-border bg-background text-foreground shadow-xs">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col leading-tight">
                        <span className="text-sm font-medium text-foreground">{label}</span>
                        <span className="truncate font-mono text-[11px] text-muted-foreground">{sub}</span>
                      </span>
                      <ArrowUpRight className="size-3.5 flex-none text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <>
          <Divider />
          <section className="flex flex-col gap-y-4">
            <Reveal className="flex items-end justify-between gap-4">
              <SectionTitle subtitle={settings.gallery_subtitle}>{settings.gallery_title}</SectionTitle>
              {memories.length > 0 ? (
                <Link
                  href="/memories"
                  data-sfx="tap"
                  className="shrink-0 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                >
                  see all {memories.length} memories →
                </Link>
              ) : (
                <span className="hidden font-mono text-[11px] text-muted-foreground sm:block">drag or swipe</span>
              )}
            </Reveal>
            <Reveal delay={80}>
              <PhotoCarousel photos={photos} />
            </Reveal>
          </section>
        </>
      )}

      {/* Skills */}
      {stack.length > 0 && (
        <>
          <Divider />
          <section className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle>Skills</SectionTitle>
            </Reveal>
            <div className="flex flex-wrap gap-2.5">
              {stack.map((item, i) => (
                <Reveal key={item.name} delay={Math.min(i * 15, 500)}>
                  <TechChip name={item.name} icon={item.icon} note={i} />
                </Reveal>
              ))}
            </div>
          </section>
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <Divider />
          <section className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle>Education</SectionTitle>
            </Reveal>
            {education.map((edu, i) => (
              <Reveal key={edu.id} delay={60 + i * 60} className="flex items-start gap-3">
                {edu.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={edu.image} alt="" className="size-9 flex-none rounded-full border bg-background object-contain p-1 shadow ring-2 ring-border" />
                )}
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{edu.school}</span>
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">{edu.degree}</span>
                    <span className="text-[11px] tabular-nums text-muted-foreground/60">
                      {[edu.period, edu.location].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </div>
              </Reveal>
            ))}
          </section>
        </>
      )}

      {/* Certifications */}
      {certs.length > 0 && (
        <>
          <Divider />
          <section className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle>Certifications</SectionTitle>
            </Reveal>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {certs.map((c, i) => (
                <Reveal key={c.id} delay={60 + i * 50}>
                  <li className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
                    <span className="flex size-8 flex-none items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
                      <Award className="size-4" />
                    </span>
                    <span className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium leading-snug">{c.title}</span>
                      <span className="text-xs text-muted-foreground">{c.subtitle}</span>
                    </span>
                  </li>
                </Reveal>
              ))}
            </ul>
          </section>
        </>
      )}

      {/* Commit graph */}
      {settings.github_username && (
        <>
          <Divider />
          <section className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle subtitle="The grey boxes are me touching grass sometimes.">Proof of work</SectionTitle>
            </Reveal>
            <Reveal delay={80}>
              <Suspense fallback={<div className="h-[118px] animate-pulse rounded-lg bg-muted/50" />}>
                <GithubActivity username={settings.github_username} />
              </Suspense>
            </Reveal>
          </section>
        </>
      )}
    </>
  );
}
