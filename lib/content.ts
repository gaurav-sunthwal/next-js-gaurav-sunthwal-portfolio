import "server-only";
import { cache } from "react";
import { asc, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import * as t from "@/lib/schema";
import { mergeSettings, isSecretSetting, type SiteSettings } from "@/lib/site-settings";
import {
  PROJECT_ITEMS,
  EXPERIENCE_ITEMS,
  TECHNICAL_CORE,
  AI_SPECIALIZATION,
  DATABASES,
  EDUCATION_ITEMS,
  CERTIFICATIONS,
  TESTIMONIALS,
} from "@/lib/data";

export type Project = typeof t.projects.$inferSelect;
export type Experience = typeof t.experiences.$inferSelect;
export type Education = typeof t.education.$inferSelect;
export type Certification = typeof t.certifications.$inferSelect;
export type Testimonial = typeof t.testimonials.$inferSelect;
export type Memory = typeof t.memories.$inferSelect;
export type StackItem = { name: string; icon?: string | null };

// Each query falls back to the bundled defaults if the database is
// unreachable, so the site still renders during an outage or a fresh setup.
async function safe<T>(label: string, query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (err) {
    console.error(`[content] ${label} failed, using fallback`, err);
    return fallback;
  }
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await safe("settings", () => db.select().from(t.settings), []);
  const map: Record<string, string> = {};
  for (const row of rows) if (!isSecretSetting(row.key)) map[row.key] = row.value;
  return mergeSettings(map);
});

export const getProjects = cache(async (): Promise<Project[]> =>
  safe(
    "projects",
    () => db.select().from(t.projects).orderBy(asc(t.projects.position)),
    PROJECT_ITEMS.map((p, i) => ({
      ...p,
      demoUrl: p.demoUrl ?? null,
      screenshots: p.screenshots ?? [],
      featured: false,
      content: null,
      youtubeUrl: null,
      position: i,
    })),
  ),
);

export const getProject = cache(async (id: string) => {
  const all = await getProjects();
  return all.find((p) => p.id === id) ?? null;
});

export const getExperiences = cache(async (): Promise<Experience[]> =>
  safe(
    "experiences",
    () => db.select().from(t.experiences).orderBy(asc(t.experiences.position)),
    EXPERIENCE_ITEMS.map((e, i) => ({ ...e, id: i + 1, logo: null, url: null, position: i })),
  ),
);

export const getEducation = cache(async (): Promise<Education[]> =>
  safe(
    "education",
    () => db.select().from(t.education),
    EDUCATION_ITEMS.map((e, i) => ({ ...e, id: i + 1, period: e.period ?? null, url: null })),
  ),
);

export const getCertifications = cache(async (): Promise<Certification[]> =>
  safe(
    "certifications",
    () => db.select().from(t.certifications),
    CERTIFICATIONS.map((c, i) => ({ ...c, id: i + 1 })),
  ),
);

export const getTestimonials = cache(async (): Promise<Testimonial[]> =>
  safe(
    "testimonials",
    () => db.select().from(t.testimonials).orderBy(asc(t.testimonials.position)),
    TESTIMONIALS.map((x, i) => ({ ...x, id: i + 1, position: i })),
  ),
);

/** Skills + AI tools + databases, merged and de-duplicated by name. */
export const getStack = cache(async (): Promise<StackItem[]> => {
  const [skills, ai, dbs] = await Promise.all([
    safe("skills", () => db.select().from(t.skills), TECHNICAL_CORE.map((s) => ({ ...s, id: 0, icon: null }))),
    safe("ai", () => db.select().from(t.aiSpecialization), AI_SPECIALIZATION.map((name) => ({ id: 0, name }))),
    safe("databases", () => db.select().from(t.databases), DATABASES.map((name) => ({ id: 0, name }))),
  ]);

  const seen = new Set<string>();
  const out: StackItem[] = [];
  const push = (name: string, icon?: string | null) => {
    const key = name.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push({ name: name.trim(), icon });
  };
  skills.forEach((s) => push(s.name, s.icon));
  dbs.forEach((d) => push(d.name));
  ai.forEach((a) => push(a.name));
  return out;
});

export const getMemories = cache(async (): Promise<Memory[]> =>
  safe(
    "memories",
    () =>
      db
        .select()
        .from(t.memories)
        .where(isNull(t.memories.deletedAt))
        .orderBy(asc(t.memories.position), asc(t.memories.id)),
    [],
  ),
);
