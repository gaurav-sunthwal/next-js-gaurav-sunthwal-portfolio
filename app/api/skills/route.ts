import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { skills } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(skills);
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name, subtitle } = body;

    if (!name || !subtitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      await db.update(skills).set({ name, subtitle }).where(eq(skills.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      const inserted = await db.insert(skills).values({ name, subtitle }).returning({ id: skills.id });
      return NextResponse.json({ success: true, inserted: inserted[0]?.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
