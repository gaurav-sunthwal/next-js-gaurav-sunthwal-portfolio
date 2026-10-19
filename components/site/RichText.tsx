import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { LinkPreview } from "./LinkPreview";
import { ProjectHoverCard, type ProjectMini } from "./ProjectHoverCard";
import { DesignToolbox } from "./DesignToolbox";

/**
 * Tiny inline formatter for admin-editable text:
 *   **bold**              → emphasised text
 *   __word__              → hand-drawn brand underline
 *   ~~word~~              → underlined word that opens the font/colour toolbox on hover
 *   [label](https://...)  → link with a live website preview on hover
 *   [label](/projects/id) → link with a project card on hover
 */
const TOKEN = /(\*\*[^*]+\*\*|__[^_]+__|~~[^~]+~~|\[[^\]]+\]\([^)\s]+\))/g;

export function RichText({ text, projects }: { text: string; projects?: Record<string, ProjectMini> }) {
  const parts = text.split(TOKEN).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => {
        let node: ReactNode = part;
        if (part.startsWith("**") && part.endsWith("**")) {
          node = <strong className="font-medium text-foreground">{part.slice(2, -2)}</strong>;
        } else if (part.startsWith("__") && part.endsWith("__")) {
          node = <span className="scribble text-foreground">{part.slice(2, -2)}</span>;
        } else if (part.startsWith("~~") && part.endsWith("~~")) {
          node = <DesignToolbox>{part.slice(2, -2)}</DesignToolbox>;
        } else {
          const link = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
          if (link) {
            const [, label, href] = link;
            const projectId = href.match(/^\/projects\/([^/?#]+)/)?.[1];
            const project = projectId ? projects?.[projectId] : undefined;
            if (project) {
              node = <ProjectHoverCard project={project}>{label}</ProjectHoverCard>;
            } else if (/^https?:\/\//.test(href)) {
              node = <LinkPreview href={href}>{label}</LinkPreview>;
            } else {
              node = (
                <Link href={href} className="font-medium text-foreground underline underline-offset-2">
                  {label}
                </Link>
              );
            }
          }
        }
        return <Fragment key={i}>{node}</Fragment>;
      })}
    </>
  );
}
