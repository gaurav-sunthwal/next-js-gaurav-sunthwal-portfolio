import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { experiences } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(experiences).orderBy(asc(experiences.position));
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, company, role, period, badge, badgeType, bullets, tech } = body;

    if (!company || !role || !period) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      // Update
      await db
        .update(experiences)
        .set({ company, role, period, badge, badgeType, bullets, tech })
        .where(eq(experiences.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      // Insert
      const inserted = await db.insert(experiences).values({
        company,
        role,
        period,
        badge: badge || "",
        badgeType: badgeType || "primary",
        bullets: bullets || [],
        tech: tech || [],
      }).returning({ id: experiences.id });
      return NextResponse.json({ success: true, inserted: inserted[0]?.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
