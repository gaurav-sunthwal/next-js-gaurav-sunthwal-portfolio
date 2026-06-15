"use client";

import React, { useEffect } from "react";
import { ProjectItem } from "@/lib/data";

interface ProjectDrawerProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDrawer: React.FC<ProjectDrawerProps> = ({ project, onClose }) => {
  const [activeScreenshotIdx, setActiveScreenshotIdx] = React.useState(0);

  React.useEffect(() => {
    setActiveScreenshotIdx(0);
  }, [project]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (project) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full md:w-[600px] lg:w-[720px] h-full bg-surface-container-lowest border-l border-outline-variant/30 shadow-2xl flex flex-col z-10 transition-transform duration-500 ease-out translate-x-0 animate-slide-in">
        {/* Header bar */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-outline-variant/20 bg-surface/50 backdrop-blur-md">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
              Project Showcase
            </span>
            <h2 className="font-headline-lg text-headline-lg tracking-tight leading-tight text-on-surface">
              {project.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-high hover:bg-primary/10 text-on-surface-variant hover:text-primary transition-colors cursor-pointer group active:scale-95"
            aria-label="Close panel"
          >
            <span className="material-symbols-outlined transition-transform group-hover:rotate-90">
              close
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-background/50">
          {/* Working Showcase view */}
          {project.type === "web" ? (
            <div className="flex flex-col space-y-3">
              <span className="font-label-md text-label-md text-secondary font-semibold">Live Preview</span>
              {/* Web Browser Frame Mockup */}
              <div className="border border-outline-variant/30 rounded-2xl overflow-hidden bg-surface-container-lowest shadow-md flex flex-col h-[450px]">
                {/* Browser bar */}
                <div className="bg-surface-container-high px-4 py-3 flex items-center gap-3 border-b border-outline-variant/20">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>
                    <span className="w-3 h-3 rounded-full bg-green-400 inline-block"></span>
                  </div>
                  <div className="flex-grow max-w-md mx-auto bg-surface-container-lowest rounded-lg py-1 px-4 text-xs text-secondary truncate flex items-center gap-2 border border-outline-variant/10">
                    <span className="material-symbols-outlined text-[12px] text-green-600">lock</span>
                    {project.demoUrl || "https://coursecrafter.ai"}
                  </div>
                </div>
                {/* Iframe View / Video Player */}
                <div className="flex-grow relative bg-slate-100">
                  {project.demoUrl && [".mp4", ".mov", ".webm", ".ogg", ".m4v"].some(ext => project.demoUrl!.toLowerCase().endsWith(ext) || project.demoUrl!.toLowerCase().includes("video")) ? (
                    <video
                      src={project.demoUrl}
                      className="w-full h-full object-contain bg-black"
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <iframe
                      src={project.demoUrl}
                      className="w-full h-full border-none"
                      title={`${project.title} Live Demo`}
                      sandbox="allow-scripts allow-same-origin"
                    />
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col space-y-3 items-center">
              <span className="font-label-md text-label-md text-secondary font-semibold self-start">
                App Showcase & Mobile UI
              </span>

              {/* iPhone Model Mockup Container */}
              <div className="relative mx-auto border-gray-800 bg-gray-900 border-[12px] rounded-[3rem] h-[550px] w-[270px] shadow-2xl flex-shrink-0 group overflow-hidden">
                {/* iPhone notch / Dynamic Island */}
                <div className="w-[110px] h-[22px] bg-gray-900 top-2 left-1/2 -translate-x-1/2 rounded-full absolute z-30 flex items-center justify-between px-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
                  <div className="w-4 h-1 rounded-full bg-slate-800"></div>
                </div>
                {/* Volume / Power buttons details */}
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[15px] top-[100px] rounded-r-lg"></div>
                <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[15px] top-[154px] rounded-r-lg"></div>
                <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[15px] top-[120px] rounded-l-lg"></div>

                {/* iPhone screen area */}
                <div className="rounded-[2.2rem] overflow-hidden w-full h-full bg-surface-container relative group/screen">
                  {(() => {
                    const validScreenshots = (project.screenshots || []).filter(s => s && s.trim() !== "");
                    const hasMedia = validScreenshots.length > 0 || (project.image && project.image.trim() !== "");
                    
                    if (!hasMedia) {
                      return (
                        <div className="w-full h-full flex items-center justify-center text-secondary text-xs">
                          No Screenshots
                        </div>
                      );
                    }

                    const mediaUrl = validScreenshots.length > 0 
                      ? validScreenshots[activeScreenshotIdx] 
                      : project.image;
                    const isVideo = mediaUrl && [".mp4", ".mov", ".webm", ".ogg", ".m4v"].some(ext => mediaUrl.toLowerCase().endsWith(ext) || mediaUrl.toLowerCase().includes("video"));

                    return (
                      <div className="w-full h-full relative">
                        {isVideo ? (
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover"
                            controls
                            autoPlay
                            muted
                            loop
                            playsInline
                          />
                        ) : (
                          <img
                            src={mediaUrl}
                            alt={`${project.title} screenshot`}
                            className="w-full h-full object-cover"
                          />
                        )}

                        {/* Left/Right Click Nav Arrows */}
                        {validScreenshots.length > 1 && (
                          <>
                            <button
                              type="button"
                              onClick={() => setActiveScreenshotIdx(prev => (prev === 0 ? validScreenshots.length - 1 : prev - 1))}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer transition-colors z-20"
                            >
                              <span className="material-symbols-outlined text-sm">chevron_left</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveScreenshotIdx(prev => (prev === validScreenshots.length - 1 ? 0 : prev + 1))}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center cursor-pointer transition-colors z-20"
                            >
                              <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </button>

                            {/* Navigation Dots Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full flex gap-1 z-20">
                              {validScreenshots.map((_, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setActiveScreenshotIdx(idx)}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeScreenshotIdx ? 'bg-white w-3' : 'bg-white/50'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Details / Text description */}
          <div className="space-y-6 pt-4 border-t border-outline-variant/20">
            <div>
              <span className="font-label-md text-label-md text-secondary block mb-2 font-semibold">
                About the Project
              </span>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                {project.description}
              </p>
            </div>

            <div>
              <span className="font-label-md text-label-md text-secondary block mb-2 font-semibold">
                Technology Stack Used
              </span>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-surface-container px-3 py-1.5 rounded-xl border border-outline-variant/20 font-label-sm text-label-sm text-secondary font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {project.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 active:scale-95 ${
                    link.label.toLowerCase().includes("view") || link.label.toLowerCase().includes("demo")
                      ? "bg-primary text-on-primary hover:bg-primary-container shadow-md"
                      : "border border-outline-variant text-on-surface hover:bg-surface-container"
                  }`}
                >
                  <span>{link.label}</span>
                  <span className="material-symbols-outlined text-[18px]">{link.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
