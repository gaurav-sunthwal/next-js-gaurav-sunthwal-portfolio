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
    const { id, degree, school } = body;
    const location = body.location || "";
    const image = body.image || "";
    const period = body.period?.trim() || null;
    const url = body.url?.trim() || null;

    if (!degree || !school) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      await db.update(education).set({ degree, school, location, image, period, url }).where(eq(education.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      const inserted = await db.insert(education).values({ degree, school, location, image, period, url }).returning({ id: education.id });
      return NextResponse.json({ success: true, inserted: inserted[0]?.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
