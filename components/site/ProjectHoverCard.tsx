"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { FloatingPortal, useHoverPopup } from "./Floating";

export type ProjectMini = { id: string; title: string; description: string; image: string; logo?: string };

/** Link to one of your projects that shows a small card (image + summary) on hover. */
export function ProjectHoverCard({ project, children }: { project: ProjectMini; children: ReactNode }) {
  const { open, rect, triggerRef, triggerProps, popupProps } = useHoverPopup({ openDelay: 100, closeDelay: 120 });

  return (
    <>
      <Link
        ref={(el) => {
          triggerRef.current = el;
        }}
        href={`/projects/${project.id}`}
        className="font-medium text-foreground underline underline-offset-2"
        data-sfx-hover="whisper"
        {...triggerProps}
      >
        {children}
        <sup className="ml-0.5 text-[9px] text-brand">?</sup>
      </Link>
      {rect && (
        <FloatingPortal rect={rect} width={256} height={230} align="start">
          <Link
            href={`/projects/${project.id}`}
            tabIndex={-1}
            aria-hidden="true"
            {...popupProps}
            className={`block overflow-hidden rounded-lg border border-border bg-background shadow-md transition-[opacity,transform] duration-150 ${
              open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
            }`}
          >
            {project.image && (
              <span className="stripes block aspect-[16/9] w-full overflow-hidden border-b border-border bg-canvas">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={project.image} alt="" loading="lazy" className="size-full object-cover" />
              </span>
            )}
            <span className="flex flex-col gap-1 p-3">
              <span className="flex items-center gap-1.5">
                {project.logo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={project.logo} alt="" className="size-4 rounded border border-border object-cover" />
                )}
                <span className="font-space text-sm font-medium text-foreground">{project.title}</span>
              </span>
              <span className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{project.description}</span>
              <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium text-brand">
                View project <ArrowRight className="size-3" />
              </span>
            </span>
          </Link>
        </FloatingPortal>
      )}
    </>
  );
}
