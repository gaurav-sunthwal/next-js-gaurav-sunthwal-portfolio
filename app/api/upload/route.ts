import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "portfolio";

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Supabase storage is not configured" }, { status: 500 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    // Upload to Supabase Storage via REST API
    const uploadUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/${bucketName}/${filePath}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": file.type,
      },
      body: buffer,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error("Supabase upload error:", errorText);
      return NextResponse.json({ error: `Upload failed: ${errorText}` }, { status: 500 });
    }

    // Get public URL
    const publicUrl = `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${bucketName}/${filePath}`;
    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("Upload API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
