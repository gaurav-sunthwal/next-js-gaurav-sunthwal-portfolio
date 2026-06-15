"use client";

import React, { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/components/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-24" />,
});
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import { ListItem } from "@/components/ListItem";
import { Button } from "@/components/Button";
import {
  TECHNICAL_CORE,
  AI_SPECIALIZATION,
  DATABASES,
  EDUCATION_ITEMS,
  CERTIFICATIONS,
  SkillItem,
  EducationItem,
  CertificationItem
} from "@/lib/data";

export default function SkillsPage() {
  const [skillsList, setSkillsList] = React.useState<SkillItem[]>(TECHNICAL_CORE);
  const [aiSpecsList, setAiSpecsList] = React.useState<string[]>(AI_SPECIALIZATION);
  const [databasesList, setDatabasesList] = React.useState<string[]>(DATABASES);
  const [educationList, setEducationList] = React.useState<EducationItem[]>(EDUCATION_ITEMS);
  const [certsList, setCertsList] = React.useState<CertificationItem[]>(CERTIFICATIONS);

  // We fetch directly from the local file data imports instead of dynamic DB calls.
  // This enables hot-reload updates and database-free operations.

  useEffect(() => {
    // Back to top button scroll handler
    const handleScroll = () => {
      const btn = document.getElementById("backToTop");
      if (btn) {
        if (window.scrollY > 300) {
          btn.style.opacity = "1";
          btn.style.transform = "translateY(0)";
        } else {
          btn.style.opacity = "0";
          btn.style.transform = "translateY(40px)";
        }
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Section entry animations
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-10");
        }
      });
    }, observerOptions);

    const animatedSections = document.querySelectorAll("section");
    animatedSections.forEach((section) => {
      section.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-10");
      observer.observe(section);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      animatedSections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col selection:bg-primary/20 selection:text-primary antialiased">
      <Navigation />

      <main className="flex-grow pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
        {/* Header Section */}
        <header className="mb-16 md:mb-24">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-4 block font-semibold">
            Competencies
          </span>
          <h1 className="font-display-lg text-display-lg mb-6 leading-tight tracking-tight">
            Mastery & <span className="gradient-text bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Academic Foundation</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            A specialized skill set bridging the gap between high-performance technical engineering and modern artificial intelligence architectures.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-gutter-desktop">
          {/* Technical Core Section (Bento Style) */}
          <Card interactive={false} className="md:col-span-7 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                terminal
              </span>
              <h2 className="font-title-md text-title-md text-on-surface">Technical Core</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {skillsList.map((skill) => (
                <Card
                  key={skill.name}
                  interactive={true}
                  className="skill-chip p-4 bg-surface border border-outline-variant/20 flex flex-col gap-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:shadow-primary/5 cursor-default"
                >
                  <span className="font-label-md text-label-md font-bold text-on-surface">{skill.name}</span>
                  <span className="text-xs text-on-surface-variant">{skill.subtitle}</span>
                </Card>
              ))}
            </div>
          </Card>

          {/* AI Specialization Section */}
          <section className="md:col-span-5 bg-primary-container text-on-primary-container rounded-xl p-8 shadow-lg relative overflow-hidden">
            <div className="absolute -right-12 -top-12 opacity-10">
              <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                psychology
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                  bolt
                </span>
                <h2 className="font-title-md text-title-md text-white">AI Specialization</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {aiSpecsList.map((spec) => (
                  <span
                    key={spec}
                    className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full font-label-md text-label-md text-white border border-white/20"
                  >
                    {spec}
                  </span>
                ))}
              </div>
              <p className="mt-8 text-white/80 font-body-md text-body-md">
                Deep integration of LLM providers and orchestration frameworks to build autonomous agentic workflows.
              </p>
            </div>
          </section>

          {/* Databases & Infrastructure */}
          <section className="md:col-span-4 bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                database
              </span>
              <h2 className="font-title-md text-title-md">Databases</h2>
            </div>
            <ul className="space-y-4">
              {databasesList.map((db, idx) => (
                <li
                  key={db}
                  className={`flex items-center justify-between ${idx < databasesList.length - 1 ? "border-b border-outline-variant/30 pb-3" : ""}`}
                >
                  <span className="font-body-md text-body-md">{db}</span>
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">check_circle</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Education & Certifications */}
          <section className="md:col-span-8 space-y-8">
            {/* Education Card */}
            {educationList.map((edu) => (
              <Card
                key={edu.degree}
                interactive={false}
                className="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/5 translate-x-full group-hover:translate-x-0 transition-transform duration-500 pointer-events-none"></div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-2">
                    <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider mb-2 block">
                      Education
                    </span>
                    <h3 className="font-title-md text-title-md text-on-surface">{edu.degree}</h3>
                    <p className="font-body-lg text-body-lg text-on-surface-variant">{edu.school}</p>
                    <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md pt-2">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>{edu.location}</span>
                    </div>
                  </div>
                  <div className="md:w-32 h-32 rounded-xl overflow-hidden bg-surface-dim shadow-inner flex-shrink-0">
                    <img
                      alt={edu.school}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      src={edu.image}
                      loading="lazy"
                    />
                  </div>
                </div>
              </Card>
            ))}

            {/* Certifications Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {certsList.map((cert, idx) => (
                <Card
                  key={cert.title}
                  interactive={true}
                  className="p-6 bg-surface-bright rounded-2xl border border-outline-variant/20 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary flex-shrink-0">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      {idx % 2 === 0 ? "workspace_premium" : "card_membership"}
                    </span>
                  </div>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface font-bold leading-snug">
                      {cert.title}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1 leading-normal">{cert.subtitle}</p>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        </div>

        {/* Decorative Animated Background Asset */}
        <div className="mt-24 h-64 rounded-[2.5rem] overflow-hidden relative shadow-inner bg-surface-container flex items-center justify-center text-center">
          <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#008489_1.5px,transparent_1.5px)] bg-[size:16px_16px]"></div>
          <div className="relative z-10 space-y-2">
            <p className="font-title-md text-title-md font-bold text-on-surface opacity-80">
              Building for the Future
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold">
              Precision & Innovation
            </p>
          </div>
        </div>
      </main>

      {/* Back to Top Micro-interaction */}
      <Button
        variant="secondary"
        onClick={handleBackToTop}
        className="fixed bottom-8 right-8 w-12 h-12 rounded-full p-0 flex items-center justify-center text-primary opacity-0 translate-y-10 transition-all duration-300 z-50 hover:bg-primary hover:text-white border border-outline-variant/10 shadow-lg cursor-pointer"
        id="backToTop"
      >
        <span className="material-symbols-outlined">arrow_upward</span>
      </Button>

      <Footer />
    </div>
  );
}
