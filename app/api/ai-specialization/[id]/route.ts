import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { aiSpecialization } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(aiSpecialization).where(eq(aiSpecialization.id, Number(id)));
    return NextResponse.json({ success: true, deleted: id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
