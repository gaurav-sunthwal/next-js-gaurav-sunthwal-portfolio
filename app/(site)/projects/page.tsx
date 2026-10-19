import type { Metadata } from "next";
import { getProjects } from "@/lib/content";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/ui";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Projects by Gaurav Sunthwal, full stack developer and AI engineer: Next.js web apps, React Native mobile apps and Generative AI products.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-2">
        <Reveal>
          <h1 className="font-space text-2xl font-medium tracking-tight">
            Projects<span className="text-brand">.</span>
          </h1>
        </Reveal>
        <Reveal delay={80}>
          <p className="text-sm text-muted-foreground">
            AI products, full-stack web apps and mobile apps — things I built and shipped.
          </p>
        </Reveal>
      </div>
      <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal key={project.id} delay={60 + Math.min(i, 8) * 50}>
            <ProjectCard project={project} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
