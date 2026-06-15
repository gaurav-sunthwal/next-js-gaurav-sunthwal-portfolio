"use client"
import React, { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { PROJECT_ITEMS, ProjectItem } from "@/lib/data";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-24" />,
});
const ProjectDrawer = dynamic(() => import("@/components/ProjectDrawer").then(mod => ({ default: mod.ProjectDrawer })), {
  ssr: false,
});

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(PROJECT_ITEMS);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProjectsList(data);
        }
      } catch (err) {
        console.error("Failed to load projects from DB", err);
      }
    };
    loadProjects();
  }, []);

  useEffect(() => {
    // Intersection Observer for stagger-in scroll transitions
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-[20px]");
        }
      });
    }, observerOptions);

    const animatedElements = document.querySelectorAll(".stagger-in");
    animatedElements.forEach((el) => {
      el.classList.add("transition-all", "duration-[600ms]", "ease-[cubic-bezier(0.2,0,0,1)]", "opacity-0", "translate-y-[20px]");
      observer.observe(el);
    });

    return () => {
      animatedElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary antialiased">
      <Navigation />

      <main className="flex-grow pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Header Section */}
        <header className="mb-16 md:mb-24 stagger-in" style={{ transitionDelay: "0.1s" }}>
          <div className="max-w-2xl">
            <h1 className="font-display-lg text-display-lg mb-6 leading-tight tracking-tight">
              Crafting Digital <span className="text-primary">Intelligence</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
              A curated collection of full-stack applications focusing on the intersection of Artificial Intelligence and user-centric software engineering.
            </p>
          </div>
        </header>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-gutter-desktop">
          {projectsList.map((project, idx) => (
            <Card
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="project-card-hover group p-0 overflow-hidden border border-outline-variant/30 stagger-in flex flex-col h-full shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.99] cursor-pointer"
              style={{ transitionDelay: `${0.2 + idx * 0.1}s` }}
            >
              <div className="aspect-[16/10] overflow-hidden bg-surface-container relative">
                <img
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  src={project.image}
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag) => {
                    const isAi = tag.toLowerCase().includes("ai") || tag.toLowerCase().includes("gen");
                    return (
                      <Chip
                        key={tag}
                        active={isAi}
                        className={`px-3 py-1 rounded-full font-label-sm text-label-sm border-none cursor-pointer hover:border-transparent ${
                          isAi
                            ? "bg-primary-container text-on-primary-container hover:bg-primary-container hover:text-on-primary-container"
                            : "bg-secondary-container text-on-secondary-container hover:bg-secondary-container hover:text-on-secondary-container"
                        }`}
                      >
                        {tag}
                      </Chip>
                    );
                  })}
                </div>
                <h2 className="font-headline-lg text-headline-lg mb-3 tracking-tight">{project.title}</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6 flex-grow leading-relaxed">
                  {project.description}
                </p>
                <div className="flex items-center gap-4 pt-4 border-t border-outline-variant/20">
                  {project.links.map((link) => (
                    <span
                      key={link.label}
                      className={`flex items-center gap-2 font-label-md text-label-md hover:underline ${
                        link.label.toLowerCase().includes("view") || link.label.toLowerCase().includes("demo")
                          ? "text-primary font-semibold"
                          : "text-secondary"
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          ))}

          {/* Connect Card */}
          <article
            className="flex flex-col justify-center items-center p-8 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 stagger-in text-center h-full min-h-[400px]"
            style={{ transitionDelay: `${0.2 + projectsList.length * 0.1}s` }}
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-primary text-[32px]">add</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg mb-2 text-on-surface tracking-tight">
              Interested in working together?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-xs leading-relaxed">
              I'm currently open to new collaborations and full-stack development opportunities.
            </p>
            <Button
              href="/contact"
              variant="primary"
              className="px-8 py-3 h-auto rounded-full font-label-md text-label-md border-none"
            >
              Start a Conversation
            </Button>
          </article>
        </div>
      </main>

      <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />

      <Footer />
    </div>
  );
}
