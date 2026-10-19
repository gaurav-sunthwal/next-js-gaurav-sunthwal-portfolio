import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { projects } from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const list = await db.select().from(projects).orderBy(asc(projects.position));
    return NextResponse.json(list);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, description, image, tags, type, demoUrl, screenshots, links } = body;
    const featured = Boolean(body.featured);
    const content = typeof body.content === "string" && body.content.trim() ? body.content : null;
    const youtubeUrl = typeof body.youtubeUrl === "string" && body.youtubeUrl.trim() ? body.youtubeUrl.trim() : null;

    if (!id || !title || !description || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if project exists
    const existing = await db.select().from(projects).where(eq(projects.id, id));

    if (existing.length > 0) {
      // Update
      await db
        .update(projects)
        .set({ title, description, image, tags, type, demoUrl, screenshots, links, featured, content, youtubeUrl })
        .where(eq(projects.id, id));
      return NextResponse.json({ success: true, updated: id });
    } else {
      // Insert
      await db.insert(projects).values({
        id,
        title,
        description,
        image,
        tags: tags || [],
        type: type || "web",
        demoUrl: demoUrl || "",
        screenshots: screenshots || [],
        links: links || [],
        featured,
        content,
        youtubeUrl,
      });
      return NextResponse.json({ success: true, inserted: id });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
