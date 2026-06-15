"use client";

import React, { useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import dynamic from "next/dynamic";

import { EXPERIENCE_ITEMS, ExperienceItem } from "@/lib/data";

const Footer = dynamic(() => import("@/components/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-24" />,
});
const Connect = dynamic(() => import("@/components/Connect").then(mod => ({ default: mod.Connect })), {
  loading: () => <div className="h-64 animate-pulse bg-surface-container rounded-2xl" />,
});

export default function ExperiencePage() {
  const [experienceList, setExperienceList] = React.useState<ExperienceItem[]>(EXPERIENCE_ITEMS);
  const [resumeUrl, setResumeUrl] = React.useState("#");

  useEffect(() => {
    const loadExperience = async () => {
      try {
        const res = await fetch("/api/experience");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setExperienceList(data);
        }
      } catch (err) {
        console.error("Failed to load experience from DB", err);
      }
    };
    loadExperience();

    const loadSettings = async () => {
      try {
        const res = await fetch("/api/settings?key=resume_url");
        if (res.ok) {
          const settingData = await res.json();
          if (settingData && settingData.value) setResumeUrl(settingData.value);
        }
      } catch (err) {
        console.error("Failed to load resume URL", err);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    // Intersection Observer for reveal animations (e.g. Connect banner)
    const revealObserverOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        }
      });
    }, revealObserverOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => revealObserver.observe(el));

    // Micro-interaction for timeline scroll appearance
    const timelineObserverOptions = {
      threshold: 0.2,
    };

    const timelineObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100", "translate-y-0");
          entry.target.classList.remove("opacity-0", "translate-y-12");
        }
      });
    }, timelineObserverOptions);

    const timelineItems = document.querySelectorAll(".timeline-item");
    timelineItems.forEach((el) => {
      el.classList.add("transition-all", "duration-700", "opacity-0", "translate-y-12");
      timelineObserver.observe(el);
    });

    return () => {
      revealElements.forEach((el) => revealObserver.unobserve(el));
      timelineItems.forEach((el) => timelineObserver.unobserve(el));
    };
  }, []);

  const handleContactClick = () => {
    const contactSection = document.getElementById("cta-contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background flex flex-col antialiased">
      <Navigation onContactClick={handleContactClick} />

      <main className="pt-32 pb-24 flex-1">
        {/* Hero Section */}
        <header className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-20 text-center md:text-left">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-4 tracking-tighter">
            Professional Journey
          </h1>
          <p className="font-body-lg text-body-lg text-secondary max-w-2xl">
            A timeline of building scalable digital solutions, from full-stack web platforms to high-performance mobile applications.
          </p>
        </header>

        {/* Experience Timeline Section */}
        <section className="px-margin-mobile md:px-margin-desktop max-w-6xl mx-auto relative z-10">
          {/* Vertical Timeline Line */}
          <div
            className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 hidden md:block z-10"
            style={{
              background: "linear-gradient(to bottom, transparent, #008489 15%, #008489 85%, transparent)",
            }}
          ></div>
          
          <div className="space-y-16 relative z-10">
            {experienceList.map((item, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div
                  key={item.company}
                  className={`relative flex flex-col md:flex-row gap-8 items-start md:items-center w-full group timeline-item ${
                    isEven ? "" : "md:flex-row-reverse"
                  }`}
                >
                  {/* Central Node Dot */}
                  <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-primary-fixed hidden md:block z-20 transition-transform group-hover:scale-125"></div>

                  {/* Header/Info Column */}
                  <div className={`w-full md:w-1/2 ${isEven ? "md:pr-8 md:text-right" : "md:pl-8 md:text-left"} z-10`}>
                    <span
                      className={`font-label-sm text-label-sm uppercase tracking-widest px-3 py-1 rounded-full mb-3 inline-block ${
                        item.badgeType === "primary"
                          ? "bg-primary-fixed/30 text-primary"
                          : "bg-surface-container text-secondary"
                      }`}
                    >
                      {item.badge}
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface leading-none mb-1">
                      {item.company}
                    </h2>
                    <p className="font-title-md text-title-md text-secondary mb-4">{item.role}</p>
                  </div>

                  {/* Glass Details Card Column */}
                  <div className={`w-full md:w-1/2 ${isEven ? "md:pl-8" : "md:pr-8"} z-10`}>
                    <Card
                      interactive={false}
                      className="glass-card p-8 rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-lg transition-shadow bg-white/70 backdrop-blur-md"
                    >
                      <ul className={`space-y-4 font-body-md text-body-md text-on-surface-variant mb-6 ${
                        isEven ? "" : "md:text-right"
                      }`}>
                        {item.bullets.map((bullet, bulletIdx) => (
                          <li
                            key={bulletIdx}
                            className={`flex gap-3 items-start ${isEven ? "" : "md:flex-row-reverse"}`}
                          >
                            <span className="material-symbols-outlined text-primary text-[20px] shrink-0">
                              check_circle
                            </span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>

                      <div className={`flex flex-wrap gap-2 ${isEven ? "" : "md:justify-end"}`}>
                        {item.tech.map((t) => (
                          <Chip
                            key={t}
                            active={false}
                            className="bg-surface-container-low px-3 py-1 rounded-full border border-outline-variant/30 font-label-sm text-label-sm text-secondary hover:text-secondary hover:border-outline-variant/30 cursor-default"
                          >
                            {t}
                          </Chip>
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Visual Interest / CTA Section */}
        <Connect
          id="cta-contact"
          title="Let's build the next big thing together."
          description="Currently open to opportunities in Full Stack and App Development roles where I can contribute to high-impact projects."
          primaryButtonText="Hire Me"
          primaryButtonHref="mailto:gauravsunthwalwork@gmail.com"
          secondaryButtonText="Download CV"
          secondaryButtonHref={resumeUrl === "#" ? undefined : resumeUrl}
          showLinks={false}
        />
      </main>

      <Footer />
    </div>
  );
}
