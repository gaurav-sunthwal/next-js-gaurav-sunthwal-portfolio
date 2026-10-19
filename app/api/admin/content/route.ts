import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/lib/db";
import * as t from "@/lib/schema";

export const dynamic = "force-dynamic";

// Admin-only (enforced in proxy.ts). Loads everything the admin panel needs in
// one request instead of nine separate ones.
export async function GET() {
  try {
    const [projects, experiences, skills, education, certifications, testimonials, aiSpecialization, databases, settingsRows] =
      await Promise.all([
        db.select().from(t.projects).orderBy(asc(t.projects.position)),
        db.select().from(t.experiences).orderBy(asc(t.experiences.position)),
        db.select().from(t.skills).orderBy(asc(t.skills.id)),
        db.select().from(t.education).orderBy(asc(t.education.id)),
        db.select().from(t.certifications).orderBy(asc(t.certifications.id)),
        db.select().from(t.testimonials).orderBy(asc(t.testimonials.position)),
        db.select().from(t.aiSpecialization).orderBy(asc(t.aiSpecialization.id)),
        db.select().from(t.databases).orderBy(asc(t.databases.id)),
        db.select().from(t.settings),
      ]);

    const settings: Record<string, string> = {};
    for (const row of settingsRows) settings[row.key] = row.value;

    return NextResponse.json({
      projects,
      experiences,
      skills,
      education,
      certifications,
      testimonials,
      aiSpecialization,
      databases,
      settings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
