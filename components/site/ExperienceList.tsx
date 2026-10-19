"use client";

import { useState } from "react";
import { ChevronDown, ArrowUpRight } from "lucide-react";
import type { Experience } from "@/lib/content";
import { RichText } from "./RichText";
import { LinkPreview } from "./LinkPreview";
import type { ProjectMini } from "./ProjectHoverCard";
import { TechIcon } from "./ui";
import { track } from "@/lib/analytics";

function splitPeriod(period: string) {
  const [start, ...rest] = period.split(/\s+[–—-]\s+/);
  return { start: start?.trim() ?? period, end: rest.join(" – ").trim() };
}

function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function ExperienceList({ items, projects }: { items: Experience[]; projects?: Record<string, ProjectMini> }) {
  const [open, setOpen] = useState<number | null>(items[0]?.id ?? null);

  return (
    <div className="-mx-3 flex flex-col gap-1">
      {items.map((item) => {
        const isOpen = open === item.id;
        const { start, end } = splitPeriod(item.period);
        const initials = item.company
          .split(/\s+/)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
        const panelId = `exp-panel-${item.id}`;

        return (
          <div key={item.id} className="relative overflow-hidden rounded-xl">
            <div
              aria-hidden="true"
              className={`absolute inset-0 rounded-xl bg-muted/40 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
            />
            <h3 className="relative flex">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                data-sfx="expand"
                onClick={() => {
                  setOpen(isOpen ? null : item.id);
                  if (!isOpen) track("experience_expand", { company: item.company });
                }}
                className="group flex flex-1 cursor-pointer items-center gap-3.5 rounded-xl px-3 py-3.5 text-left focus-visible:outline-none"
              >
                {item.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.logo}
                    alt=""
                    className="size-9 flex-none rounded-lg border border-border bg-muted object-cover sm:size-10"
                  />
                ) : (
                  <span className="flex size-9 flex-none items-center justify-center rounded-lg border border-border bg-muted font-space text-xs font-medium text-muted-foreground sm:size-10">
                    {initials}
                  </span>
                )}
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold leading-tight">{item.company}</span>
                  <span className="truncate text-xs font-normal text-muted-foreground">{item.role}</span>
                </div>
                <span className="flex flex-none flex-col items-end font-mono text-[11px] leading-tight tabular-nums text-muted-foreground sm:flex-row sm:gap-1">
                  <span>{start}</span>
                  {end && (
                    <span>
                      <span className="hidden sm:inline">– </span>
                      {end}
                    </span>
                  )}
                </span>
                <span
                  aria-hidden="true"
                  className={`flex size-7 flex-none items-center justify-center rounded-md border border-border text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground group-focus-visible:ring-2 group-focus-visible:ring-ring ${
                    isOpen ? "bg-muted text-foreground" : ""
                  }`}
                >
                  <ChevronDown className={`size-3.5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              className={`relative grid transition-[grid-template-rows,opacity,filter] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100 blur-0" : "grid-rows-[0fr] opacity-0 blur-[2px]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="grid gap-4 px-3 pb-4 pt-1 text-sm sm:pl-[66px]">
                  {item.bullets.length > 0 && (
                    <ul className="grid gap-2.5">
                      {item.bullets.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground sm:text-[13px]">
                          <span aria-hidden="true" className="mt-[0.6em] size-1 flex-none rounded-full bg-muted-foreground/40" />
                          <span>
                            <RichText text={b} projects={projects} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <ul className="flex flex-wrap gap-1.5">
                      {item.tech.map((t) => (
                        <li
                          key={t}
                          className="flex h-6 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-[11px] text-muted-foreground"
                        >
                          <TechIcon name={t} className="size-3" />
                          {t}
                        </li>
                      ))}
                    </ul>
                    {item.url && (
                      <LinkPreview
                        href={item.url}
                        className="inline-flex items-center gap-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {hostname(item.url)}
                        <ArrowUpRight className="size-3" />
                      </LinkPreview>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
