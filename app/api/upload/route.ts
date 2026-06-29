import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { db } from "@/lib/db";
import { uploadedFiles } from "@/lib/schema";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const category = (formData.get("category") as string) || "website";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const token = process.env.UPLOADTHING_TOKEN;
    if (!token) {
      return NextResponse.json({ error: "UploadThing token is not configured" }, { status: 500 });
    }

    // Initialize UTApi with token
    const utapi = new UTApi({ token });
    const uploadResult = await utapi.uploadFiles(file);

    if (!uploadResult.data) {
      const errMsg = uploadResult.error?.message || "Upload failed";
      console.error("UploadThing error:", uploadResult.error);
      return NextResponse.json({ error: errMsg }, { status: 500 });
    }

    // Save upload metadata to the database
    try {
      await db.insert(uploadedFiles).values({
        name: file.name,
        url: uploadResult.data.url,
        type: file.type || "application/octet-stream",
        size: file.size || 0,
        category,
      });
    } catch (dbErr) {
      console.error("Failed to save upload metadata to DB:", dbErr);
    }

    return NextResponse.json({ url: uploadResult.data.url });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
