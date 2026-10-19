import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { uploadedFiles } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { deleteObject, keyFromUrl } from "@/lib/r2";

export async function GET() {
  try {
    const list = await db.select().from(uploadedFiles);
    // Sort descending by date on JS side to ensure DB compatibility
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return NextResponse.json(list);
  } catch (error: any) {
    console.error("GET /api/files error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get("id");

    if (!idStr) {
      return NextResponse.json({ error: "Missing file id" }, { status: 400 });
    }

    const id = Number(idStr);
    
    // Find the file in the database
    const fileRecords = await db.select().from(uploadedFiles).where(eq(uploadedFiles.id, id));
    if (fileRecords.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }
    
    const file = fileRecords[0];

    // Delete the stored file: Cloudflare R2 for new uploads, UploadThing for older ones.
    const r2Key = keyFromUrl(file.url);
    if (r2Key) {
      try {
        await deleteObject(r2Key);
      } catch (err) {
        console.error("[R2] Failed to delete file:", err);
      }
    } else if (/utfs\.io|ufs\.sh|uploadthing/.test(file.url) && process.env.UPLOADTHING_TOKEN) {
      try {
        const key = file.url.split("/").pop();
        if (key) await new UTApi({ token: process.env.UPLOADTHING_TOKEN }).deleteFiles([key]);
      } catch (err) {
        console.error("[UploadThing] Failed to delete legacy file:", err);
      }
    }

    // Delete from Database
    await db.delete(uploadedFiles).where(eq(uploadedFiles.id, id));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/files error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
