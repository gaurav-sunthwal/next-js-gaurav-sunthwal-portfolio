import { getExperiences, getProjects, getSettings, getStack } from "@/lib/content";
import { DESCRIPTION, JOB_TITLE, PERSON_NAME, SITE_URL } from "@/lib/seo";

// /llms.txt — a plain-text profile that AI assistants and answer engines can read
// when someone asks about Gaurav Sunthwal or looks for a full stack / AI developer.
export const revalidate = 3600;

export async function GET() {
  const [settings, projects, experiences, stack] = await Promise.all([getSettings(), getProjects(), getExperiences(), getStack()]);

  const lines = [
    `# ${PERSON_NAME}`,
    "",
    `> ${DESCRIPTION}`,
    "",
    `- Role: ${JOB_TITLE}${settings.current_company ? ` (currently ${settings.current_role} at ${settings.current_company})` : ""}`,
    `- Location: ${settings.location}`,
    `- Website: ${SITE_URL}`,
    `- Email: ${settings.email}`,
    `- Available for: full stack development, mobile app development, AI / LLM integrations, freelance and full-time roles`,
    `- Contact: ${SITE_URL}/contact`,
    "",
    "## Pages",
    `- [Home](${SITE_URL}/): overview, experience, projects and skills`,
    `- [About](${SITE_URL}/about): background, links, education and certifications`,
    `- [Projects](${SITE_URL}/projects): everything Gaurav has built`,
    `- [Contact](${SITE_URL}/contact): hire or collaborate with Gaurav`,
    "",
    "## Projects",
    ...projects.map((p) => `- [${p.title}](${SITE_URL}/projects/${p.id}): ${p.description}${p.tags.length ? ` (${p.tags.join(", ")})` : ""}`),
    "",
    "## Experience",
    ...experiences.map((e) => `- ${e.role} at ${e.company} (${e.period})`),
    "",
    "## Skills",
    stack.map((s) => s.name).join(", "),
    "",
    "## Profiles",
    ...[settings.social_github, settings.social_linkedin, settings.social_x, settings.social_youtube].filter(Boolean).map((u) => `- ${u}`),
    "",
  ];

  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
