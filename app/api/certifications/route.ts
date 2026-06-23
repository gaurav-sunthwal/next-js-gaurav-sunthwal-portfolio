import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { certifications } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(certifications);
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, subtitle } = body;

    if (!title || !subtitle) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      await db.update(certifications).set({ title, subtitle }).where(eq(certifications.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      const inserted = await db.insert(certifications).values({ title, subtitle }).returning({ id: certifications.id });
      return NextResponse.json({ success: true, inserted: inserted[0]?.id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
