"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { MagneticWrap } from "@/components/MagneticWrap";
import { PROJECT_ITEMS, EXPERIENCE_ITEMS, ProjectItem, TESTIMONIALS, ExperienceItem, TestimonialItem } from "@/lib/data";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Chip } from "@/components/Chip";
import Image from "next/image";
import dynamic from "next/dynamic";
import gaurav from '@/public/Img/gaurav.jpg'
import {Connect} from "@/components/Connect"; 
// Lazy-loaded heavy components
const Footer = dynamic(() => import("@/components/Footer").then(mod => ({ default: mod.Footer })), {
  loading: () => <div className="h-24" />,
});
const ProjectDrawer = dynamic(() => import("@/components/ProjectDrawer").then(mod => ({ default: mod.ProjectDrawer })), {
  ssr: false,
});
const EmblaCarouselReact = dynamic(() => import("embla-carousel-react").then(mod => ({ default: () => null })), { ssr: false });

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
export default function Home() {
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [projectsList, setProjectsList] = useState<ProjectItem[]>(PROJECT_ITEMS);
  const [experienceList, setExperienceList] = useState<ExperienceItem[]>(EXPERIENCE_ITEMS);
  const [testimonialsList, setTestimonialsList] = useState<TestimonialItem[]>(TESTIMONIALS);
  const [resumeUrl, setResumeUrl] = useState("#");

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" }, [
    Autoplay({ delay: 5000, stopOnInteraction: false, playOnInit: false })
  ]);

  // Load from database
  useEffect(() => {
    const loadDbData = async () => {
      try {
        const resProj = await fetch("/api/projects");
        const dataProj = await resProj.json();
        if (Array.isArray(dataProj) && dataProj.length > 0) setProjectsList(dataProj);

        const resExp = await fetch("/api/experience");
        const dataExp = await resExp.json();
        if (Array.isArray(dataExp) && dataExp.length > 0) setExperienceList(dataExp);

        const resTest = await fetch("/api/testimonials");
        const dataTest = await resTest.json();
        if (Array.isArray(dataTest) && dataTest.length > 0) setTestimonialsList(dataTest);

        const resSettings = await fetch("/api/settings?key=resume_url");
        if (resSettings.ok) {
          const settingData = await resSettings.json();
          if (settingData && settingData.value) setResumeUrl(settingData.value);
        }
      } catch (err) {
        console.error("Failed to load page data from database", err);
      }
    };
    loadDbData();
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const autoplay = emblaApi.plugins().autoplay;
        if (autoplay) {
          if (entry.isIntersecting) {
            autoplay.play();
          } else {
            autoplay.stop();
          }
        }
      });
    }, { threshold: 0.1 });

    const reviewsSection = document.getElementById("reviews");
    if (reviewsSection) observer.observe(reviewsSection);

    return () => {
      observer.disconnect();
    };
  }, [emblaApi]);

  useEffect(() => {
    // Intersection Observer for reveal animations
    const revealObserverOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          const staggerItems = entry.target.querySelectorAll(".stagger-item");
          staggerItems.forEach((item, index) => {
            setTimeout(() => {
              (item as HTMLElement).style.opacity = "1";
              (item as HTMLElement).style.transform = "translateY(0)";
            }, index * 100);
          });
        }
      });
    }, revealObserverOptions);

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => revealObserver.observe(el));

    // Initialize stagger items styles
    const staggerItems = document.querySelectorAll(".stagger-item");
    staggerItems.forEach((item) => {
      (item as HTMLElement).style.opacity = "0";
      (item as HTMLElement).style.transform = "translateY(20px)";
    });

    return () => {
      revealElements.forEach((el) => revealObserver.unobserve(el));
    };
  }, []);

  const handleContactClick = () => {
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans antialiased flex flex-col">
      <Navigation onContactClick={handleContactClick} />

      <main className="pt-32 flex-1">
        {/* Profile & Hero Section */}
        <section
          className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24 md:mb-40 reveal"
          id="hero"
        >
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="stagger-item inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-wider">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Available for New Roles
              </div>
              <h1 className="stagger-item text-4xl md:text-6xl font-bold text-on-surface max-w-2xl tracking-tighter leading-tight">
                Full Stack Developer specializing in <span className="text-primary">Generative AI</span> & RAG Systems.
              </h1>
              <p className="stagger-item text-lg text-on-surface-variant max-w-xl leading-relaxed">
                Building production-ready AI products with Next.js and React Native. Focused on bridging LLM capabilities with high-performance user experiences.
              </p>
              <div className="stagger-item flex flex-wrap gap-4 pt-4">
                <MagneticWrap>
                  <Button
                    variant={"secondary"}
                    className="px-8 py-4 h-auto rounded-full font-semibold airbnb-shadow-hover flex items-center gap-2 border-none"
                    onClick={() => {
                      const projSec = document.getElementById("projects");
                      if (projSec) projSec.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <div className=" flex items-center gap-2">
                      <p>View Case Studies</p>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </div>
                  </Button>
                </MagneticWrap>
                <Button
                  variant={"outline"}
                  className="bg-surface-container-lowest border border-outline-variant/50 text-on-surface px-8 py-4 h-auto rounded-full font-semibold hover:bg-surface-container-low"
                  href={resumeUrl === "#" ? undefined : resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download Resume
                </Button>
              </div>
            </div>

            {/* Prominent Profile Section */}
            <div className="stagger-item flex-1 w-full max-w-md relative group">
              <div className="aspect-square rounded-3xl overflow-hidden airbnb-shadow relative animate-float">
                <Image
                  alt="Gaurav Sunthwal"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-w-md) 100vw, 450px"
                  src={gaurav}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <p className="text-sm font-medium opacity-80">Based in Pune, India</p>
                  <h3 className="text-xl font-bold">Gaurav Sunthwal</h3>
                </div>
              </div>
              {/* Floating Credentials */}
             
            </div>
          </div>
        </section>

        {/* Top Experience Section */}
        <section className="bg-surface-container-low py-24 reveal" id="experience">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Top Experience</h2>
                <p className="text-on-surface-variant text-lg">Delivering impact at fast-paced startups and enterprises.</p>
              </div>
              <a className="text-primary font-bold flex items-center gap-2 hover:underline transition-all" href="#">
                View All Experience <span className="material-symbols-outlined text-sm">open_in_new</span>
              </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {experienceList.slice(0, 2).map((item) => {
                const icon = item.company.toLowerCase().includes("terminal") ? "terminal" : "architecture";
                return (
                  <Card
                    key={item.company}
                    interactive={false}
                    className="bg-surface-container-lowest p-8 rounded-3xl border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <span className="text-primary font-bold text-xs uppercase tracking-widest mb-1 block">{item.period}</span>
                        <h3 className="text-2xl font-bold">{item.company}</h3>
                        <p className="text-on-surface-variant font-medium">{item.role}</p>
                      </div>
                      <div className="bg-primary/5 p-3 rounded-2xl text-primary group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined">{icon}</span>
                      </div>
                    </div>
                    <ul className="space-y-3 mb-8 text-on-surface-variant text-sm">
                      {item.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex gap-3">
                          <span className="text-primary">•</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {item.tech.map((t) => (
                        <Chip
                          key={t}
                          active={false}
                          className="px-3 py-1 bg-surface-container border-none text-xs font-bold text-on-surface-variant cursor-default hover:text-on-surface-variant hover:border-transparent"
                        >
                          {t}
                        </Chip>
                      ))}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Projects Section */}
        <section className="py-24 md:py-40 reveal" id="projects">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Featured Projects</h2>
                <p className="text-on-surface-variant text-lg">AI-powered solutions built for real-world impact.</p>
              </div>
              <a className="text-primary font-bold flex items-center gap-2 hover:underline transition-all" href="/projects">
                Explore All Projects <span className="material-symbols-outlined text-sm">grid_view</span>
              </a>
            </div>
            <div className="space-y-16">
              {projectsList.slice(0, 2).map((project, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center group cursor-pointer"
                  >
                    <div className={`w-full aspect-[16/10] bg-surface-container rounded-3xl overflow-hidden airbnb-shadow-hover border border-outline-variant/30 ${
                      isEven ? "lg:order-1" : "lg:order-2"
                    }`}>
                      <img
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        src={project.image}
                        loading="lazy"
                      />
                    </div>
                    <div className={`space-y-6 ${isEven ? "lg:order-2" : "lg:order-1"}`}>
                      <div className="flex flex-wrap items-center gap-3">
                        {project.tags.slice(0, 4).map((tag) => (
                          <Chip
                            key={tag}
                            active={true}
                            className="px-3 py-1 text-xs font-bold rounded-full uppercase border-none hover:text-white pointer-events-none"
                          >
                            {tag}
                          </Chip>
                        ))}
                        {project.tags.length > 4 && (
                          <Chip
                            key="more-tags"
                            active={false}
                            className="px-3 py-1 text-xs font-bold rounded-full uppercase border-none pointer-events-none bg-surface-container-low text-on-surface-variant/80"
                          >
                            + {project.tags.length - 4} More
                          </Chip>
                        )}
                      </div>
                      <h3 className="text-3xl md:text-4xl font-bold tracking-tighter">{project.title}</h3>
                      <p className="text-on-surface-variant text-lg leading-relaxed">{project.description}</p>
                      <div className="pt-4 flex gap-4">
                        {project.links.map((link) => {
                          const isPrimary = link.label.toLowerCase().includes("view") || link.label.toLowerCase().includes("demo");
                          return (
                            <Button
                              key={link.label}
                              variant={isPrimary ? "primary" : "secondary"}
                              className={`px-8 py-3 h-auto rounded-full font-bold transition-all ${isPrimary
                                ? "bg-on-surface text-surface hover:bg-on-surface-variant hover:bg-none border-none text-white"
                                : "border border-outline-variant text-on-surface hover:bg-surface-container"
                                }`}
                            >
                              {link.label}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Core Skills Section */}
        <section className="bg-surface-container-low py-24 md:py-32 reveal" id="skills">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            <div className="flex flex-col md:flex-row justify-between items-start gap-12">
              <div className="md:w-1/3">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">Core Skills</h2>
                <p className="text-on-surface-variant text-lg mb-8">
                  Specialized toolkit for building intelligence-first digital experiences. Focused on reliability and scalability.
                </p>
                <a className="text-primary font-bold flex items-center gap-2 hover:underline transition-all" href="#">
                  Technical Deep-dive <span className="material-symbols-outlined text-sm">analytics</span>
                </a>
              </div>
              <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Languages & Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Python</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">TypeScript</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">JavaScript</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Next.js</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">React Native</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Node.js</Chip>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">AI & ML Tools</h4>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Gemini</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">GPT-4</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Claude</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">LangChain</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">LangGraph</Chip>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Databases & Infrastructure</h4>
                  <div className="flex flex-wrap gap-2">
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">PostgreSQL</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Drizzle ORM</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Firebase</Chip>
                    <Chip active={false} className="px-3 py-1.5 bg-surface-container border-none text-sm font-medium cursor-default hover:text-[#717171] hover:border-transparent">Mongo DB</Chip>
                  </div>
                </div>
                <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/10">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Certifications</h4>
                  <ul className="text-sm space-y-2 text-on-surface-variant">
                    <li>• Complete JS Course 2021: Zero to Expert</li>
                    <li>• Build Responsive Real World Websites</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Client Testimonials / Reviews Section */}
        <section className="py-24 md:py-32 max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop reveal" id="reviews">
          <div className="flex flex-col items-center text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-on-surface">What Partners Say</h2>
            <p className="text-on-surface-variant text-lg max-w-2xl mt-4">
              Feedback from founders, engineering leads, and clients I've collaborated with.
            </p>
          </div>
          {/* Embla Carousel Viewport */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonialsList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex-[0_0_100%] md:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] min-w-0 group bg-surface-container-lowest p-8 rounded-2xl border border-outline-variant/20 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Visual quote mark */}
                    <span className="font-serif text-[40px] font-bold text-primary/30 leading-none block mb-6">99</span>
                    {/* Quote content */}
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-8">
                      "{item.quote}"
                    </p>
                  </div>
                  {/* Author Info */}
                  <div className="flex items-center gap-4 pt-6 border-t border-outline-variant/10">
                    <div className="w-10 h-10 rounded-full bg-surface-container-low text-primary flex items-center justify-center font-bold text-sm">
                      {item.avatar}
                    </div>
                    <div>
                      <h4 className="font-label-md text-label-md font-bold text-on-surface leading-tight">{item.role}</h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">{item.company}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slider Actions Buttons */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              variant={"outline"}
              onClick={() => emblaApi && emblaApi.scrollPrev()}
              className="w-12 h-12 rounded-full p-0 flex items-center justify-center text-primary bg-white hover:bg-primary hover:text-white border border-outline-variant/30 shadow-sm cursor-pointer"
              aria-label="Previous reviews"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => emblaApi && emblaApi.scrollNext()}
              className="w-12 h-12 rounded-full p-0 flex items-center justify-center text-primary bg-white hover:bg-primary hover:text-white border border-outline-variant/30 shadow-sm cursor-pointer"
              aria-label="Next reviews"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </Button>
          </div>
        </section>

        {/* Connect Section */}

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

      <ProjectDrawer project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* Footer */}
      <Footer />
    </div>
  );
}


