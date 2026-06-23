import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { education } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(education);
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, degree, school, location, image } = body;

    if (!degree || !school || !location || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      await db.update(education).set({ degree, school, location, image }).where(eq(education.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      const inserted = await db.insert(education).values({ degree, school, location, image }).returning({ id: education.id });
      return NextResponse.json({ success: true, inserted: inserted[0]?.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
