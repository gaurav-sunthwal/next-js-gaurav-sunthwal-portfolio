import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(testimonials);
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, role, company, avatar, quote } = body;

    if (!role || !company || !avatar || !quote) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      // Update
      await db.update(testimonials).set({ role, company, avatar, quote }).where(eq(testimonials.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      // Insert
      const inserted = await db.insert(testimonials).values({ role, company, avatar, quote }).returning({ id: testimonials.id });
      return NextResponse.json({ success: true, inserted: inserted[0]?.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
