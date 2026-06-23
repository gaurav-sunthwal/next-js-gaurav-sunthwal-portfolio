import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testimonials } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "Invalid testimonial IDs array" }, { status: 400 });
    }

    // Update position in database for each testimonial id in sequence
    for (let index = 0; index < ids.length; index++) {
      const id = ids[index];
      await db
        .update(testimonials)
        .set({ position: index })
        .where(eq(testimonials.id, Number(id)));
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
