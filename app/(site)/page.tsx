import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, ArrowUpRight, Briefcase, GraduationCap, Mail, MapPin, Sparkles } from "lucide-react";
import {
  getEducation,
  getExperiences,
  getProjects,
  getSettings,
  getStack,
  getTestimonials,
} from "@/lib/content";
import { parseHighlights, splitLines } from "@/lib/site-settings";
import { Avatar } from "@/components/site/Avatar";
import { RichText } from "@/components/site/RichText";
import { ExperienceList } from "@/components/site/ExperienceList";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Stack } from "@/components/site/Stack";
import { GithubActivity } from "@/components/site/GithubActivity";
import { ContactCard } from "@/components/site/ContactCard";
import { LinkPreview } from "@/components/site/LinkPreview";
import { projectMiniMap } from "@/components/site/ProjectCard";
import { VerifiedBadge } from "@/components/site/Hero";
import { Divider, Reveal, SectionTitle } from "@/components/site/ui";

// Rebuilt at most every 5 minutes, and immediately after any admin change.
export const revalidate = 300;

export default async function HomePage() {
  const [settings, experiences, education, projects, stack, testimonials] = await Promise.all([
    getSettings(),
    getExperiences(),
    getEducation(),
    getProjects(),
    getStack(),
    getTestimonials(),
  ]);

  const avatars = splitLines(settings.avatar_urls);
  const highlights = parseHighlights(settings.highlights);
  const featured = projects.filter((p) => p.featured);
  const shownProjects = (featured.length > 0 ? featured : projects).slice(0, 4);
  const school = education[0];

  // Lets [Name](/projects/id) links in the bio and experience show a project card on hover.
  const projectMap = projectMiniMap(projects);
  const isExternal = (href: string) => /^https?:\/\//.test(href);

  return (
    <>
      {/* Hero */}
      <section id="hero">
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
      </section>

      {/* About */}
      <section id="about" className="flex flex-col gap-y-3">
        <Reveal delay={200}>
          <p className="text-xs leading-snug text-muted-foreground sm:text-sm">
            <RichText text={settings.bio} projects={projectMap} />
          </p>
        </Reveal>
        <div className="flex flex-col gap-y-4 sm:flex-row sm:items-end sm:justify-between sm:gap-x-6">
          <Reveal delay={260}>
            <ul className="flex flex-col gap-y-1.5 font-mono text-[12px] text-muted-foreground md:text-[13px]">
              {settings.current_role && (
                <li className="flex items-center gap-2">
                  <Briefcase className="size-3.5 shrink-0" />
                  <span className="flex items-center gap-1.5">
                    {settings.current_role}
                    {settings.current_company && (
                      <>
                        {" "}@
                        {settings.current_company_logo && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={settings.current_company_logo} alt="" className="inline-block h-[1em] w-auto rounded-sm" />
                        )}
                        {settings.current_company_url ? (
                          <LinkPreview href={settings.current_company_url} className="font-medium text-foreground hover:underline">
                            {settings.current_company}
                          </LinkPreview>
                        ) : (
                          <span className="font-medium text-foreground">{settings.current_company}</span>
                        )}
                      </>
                    )}
                  </span>
                </li>
              )}
              {settings.location && (
                <li className="flex items-center gap-2">
                  <MapPin className="size-3.5 shrink-0" />
                  <span>{settings.location}</span>
                </li>
              )}
              {settings.email && (
                <li className="flex items-center gap-2">
                  <Mail className="size-3.5 shrink-0" />
                  <a href={`mailto:${settings.email}`} className="transition-colors hover:text-foreground">
                    {settings.email}
                  </a>
                </li>
              )}
              {highlights.map((h) => (
                <li key={h.text} className="flex items-center gap-2">
                  {h.icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={h.icon} alt="" className="size-3.5 shrink-0 object-contain" />
                  ) : (
                    <Sparkles className="size-3.5 shrink-0" />
                  )}
                  {h.href && isExternal(h.href) ? (
                    <LinkPreview href={h.href} className="underline underline-offset-2 transition-colors hover:text-foreground">
                      {h.text}
                    </LinkPreview>
                  ) : h.href ? (
                    <Link
                      href={h.href}
                      className="underline underline-offset-2 transition-colors hover:text-foreground"
                    >
                      {h.text}
                    </Link>
                  ) : (
                    <span>{h.text}</span>
                  )}
                </li>
              ))}
              {school && (
                <li className="flex items-center gap-2">
                  <GraduationCap className="size-3.5 shrink-0" />
                  <span className="flex items-center gap-1.5">
                    Studied @<span className="font-medium text-foreground">{school.school}</span>
                  </span>
                </li>
              )}
            </ul>
          </Reveal>
          <Reveal delay={320} className="shrink-0">
            <Link
              href="/about"
              data-sfx="tap"
              className="group inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background pl-3 pr-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/50"
            >
              More about me
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Divider />

      {/* Experience */}
      {experiences.length > 0 && (
        <>
          <section id="work" className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle>Experience</SectionTitle>
            </Reveal>
            <Reveal delay={80}>
              <ExperienceList items={experiences} projects={projectMap} />
            </Reveal>
          </section>
          <Divider />
        </>
      )}

      {/* Education */}
      {education.length > 0 && (
        <>
          <section id="education" className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle>Education</SectionTitle>
            </Reveal>
            <div className="flex flex-col gap-6">
              {education.map((edu, i) => {
                const inner = (
                  <>
                    {edu.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={edu.image}
                        alt=""
                        className="mt-0.5 size-7 flex-none overflow-hidden rounded-full border bg-background object-contain p-1 shadow ring-2 ring-border md:size-9"
                      />
                    )}
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 text-sm font-semibold leading-snug">
                        {edu.school}
                        {edu.url && <ArrowUpRight className="size-3.5 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted-foreground">{edu.degree}</span>
                        {(edu.period || edu.location) && (
                          <span className="text-[11px] tabular-nums text-muted-foreground/60">
                            {[edu.period, edu.location].filter(Boolean).join(" · ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                );
                return (
                  <Reveal key={edu.id} delay={80 + i * 60}>
                    {edu.url ? (
                      <LinkPreview href={edu.url} className="group flex w-fit items-start gap-x-2.5">
                        {inner}
                      </LinkPreview>
                    ) : (
                      <div className="flex w-fit items-start gap-x-2.5">{inner}</div>
                    )}
                  </Reveal>
                );
              })}
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* Projects */}
      {shownProjects.length > 0 && (
        <>
          <section id="projects" className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle>Projects</SectionTitle>
            </Reveal>
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2">
              {shownProjects.map((project, i) => (
                <Reveal key={project.id} delay={80 + i * 60}>
                  <ProjectCard project={project} />
                </Reveal>
              ))}
            </div>
            {projects.length > shownProjects.length && (
              <Reveal className="flex justify-center pt-2">
                <Link
                  href="/projects"
                  data-sfx="tap"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                >
                  View all projects
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Reveal>
            )}
          </section>
          <Divider />
        </>
      )}

      {/* Stack */}
      {stack.length > 0 && (
        <>
          <section id="skills" className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle>Stack</SectionTitle>
            </Reveal>
            <Stack items={stack} />
          </section>
          <Divider />
        </>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <>
          <section id="reviews" className="flex flex-col gap-y-6">
            <Reveal>
              <SectionTitle subtitle="What people I've worked with say.">Kind words</SectionTitle>
            </Reveal>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} delay={60 + i * 50}>
                  <figure className="flex h-full flex-col justify-between gap-4 rounded-xl border border-border bg-background p-4">
                    <blockquote className="text-xs leading-relaxed text-muted-foreground sm:text-[13px]">“{t.quote}”</blockquote>
                    <figcaption className="flex items-center gap-2.5">
                      {/^(https?:)?\/\//.test(t.avatar) || t.avatar.startsWith("/") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={t.avatar} alt="" className="size-7 rounded-full border border-border object-cover" />
                      ) : (
                        <span className="flex size-7 items-center justify-center rounded-full border border-border bg-muted font-space text-[11px] font-medium">
                          {t.avatar.slice(0, 2)}
                        </span>
                      )}
                      <span className="flex flex-col leading-tight">
                        <span className="text-xs font-medium text-foreground">{t.role}</span>
                        <span className="text-[11px] text-muted-foreground">{t.company}</span>
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </section>
          <Divider />
        </>
      )}

      {/* GitHub */}
      {settings.github_username && (
        <section id="github" className="flex flex-col gap-y-6">
          <Reveal>
            <SectionTitle subtitle="Proof I ship. The grey squares are me touching grass.">A year in commits</SectionTitle>
          </Reveal>
          <Reveal delay={80}>
            <Suspense fallback={<div className="h-[118px] animate-pulse rounded-lg bg-muted/50" />}>
              <GithubActivity username={settings.github_username} />
            </Suspense>
          </Reveal>
        </section>
      )}

      {/* Contact */}
      <section id="contact">
        <Reveal>
          <ContactCard settings={settings} />
        </Reveal>
      </section>
    </>
  );
}
