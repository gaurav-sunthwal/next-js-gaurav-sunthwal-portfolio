import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function GET() {
  try {
    const data = getSkillsData();
    return NextResponse.json(data.CERTIFICATIONS);
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

    const data = getSkillsData();
    if (id) {
      // Update
      const index = data.CERTIFICATIONS.findIndex((c: any) => c.id === Number(id));
      if (index !== -1) {
        data.CERTIFICATIONS[index] = { id: Number(id), title, subtitle };
        saveSkillsData(data);
        return NextResponse.json({ success: true, updated: id });
      }
      return NextResponse.json({ error: "Certification not found" }, { status: 404 });
    } else {
      // Insert
      const maxId = data.CERTIFICATIONS.reduce((max: number, c: any) => (c.id > max ? c.id : max), 0);
      const newId = maxId + 1;
      data.CERTIFICATIONS.push({ id: newId, title, subtitle });
      saveSkillsData(data);
      return NextResponse.json({ success: true, inserted: newId });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
