import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function GET() {
  try {
    const data = getSkillsData();
    return NextResponse.json(data.TECHNICAL_CORE);
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

    const data = getSkillsData();
    if (id) {
      // Update
      const index = data.TECHNICAL_CORE.findIndex((s: any) => s.id === Number(id));
      if (index !== -1) {
        data.TECHNICAL_CORE[index] = { id: Number(id), name, subtitle };
        saveSkillsData(data);
        return NextResponse.json({ success: true, updated: id });
      }
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    } else {
      // Insert
      const maxId = data.TECHNICAL_CORE.reduce((max: number, s: any) => (s.id > max ? s.id : max), 0);
      const newId = maxId + 1;
      data.TECHNICAL_CORE.push({ id: newId, name, subtitle });
      saveSkillsData(data);
      return NextResponse.json({ success: true, inserted: newId });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
