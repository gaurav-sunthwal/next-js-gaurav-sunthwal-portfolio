import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/schema";
import { eq, asc, desc } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(testimonials).orderBy(asc(testimonials.position));
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, role, company, avatar, quote, position } = body;

    if (!role || !company || !avatar || !quote) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      // Update
      const updateData: any = { role, company, avatar, quote };
      if (position !== undefined) updateData.position = Number(position);
      await db.update(testimonials).set(updateData).where(eq(testimonials.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      // Insert
      const currentTestimonials = await db.select().from(testimonials).orderBy(desc(testimonials.position)).limit(1);
      const nextPosition = currentTestimonials.length > 0 ? (currentTestimonials[0].position || 0) + 1 : 0;
      const inserted = await db.insert(testimonials).values({
        role,
        company,
        avatar,
        quote,
        position: position !== undefined ? Number(position) : nextPosition,
      }).returning({ id: testimonials.id });
      return NextResponse.json({ success: true, inserted: inserted[0]?.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
