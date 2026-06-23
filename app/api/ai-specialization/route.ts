import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiSpecialization } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const list = await db.select().from(aiSpecialization);
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, name } = body;

    if (!name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (id) {
      await db.update(aiSpecialization).set({ name }).where(eq(aiSpecialization.id, Number(id)));
      return NextResponse.json({ success: true, updated: id });
    } else {
      const names = name.split(",").map((n: string) => n.trim()).filter(Boolean);
      const insertedIds = [];
      for (const singleName of names) {
        const inserted = await db.insert(aiSpecialization).values({ name: singleName }).returning({ id: aiSpecialization.id });
        insertedIds.push(inserted[0]?.id);
      }
      return NextResponse.json({ success: true, inserted: insertedIds });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
