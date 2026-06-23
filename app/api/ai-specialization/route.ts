import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function GET() {
  try {
    const data = getSkillsData();
    return NextResponse.json(data.AI_SPECIALIZATION);
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

    const data = getSkillsData();
    if (id) {
      // Update
      const index = data.AI_SPECIALIZATION.findIndex((a: any) => a.id === Number(id));
      if (index !== -1) {
        data.AI_SPECIALIZATION[index] = { id: Number(id), name };
        saveSkillsData(data);
        return NextResponse.json({ success: true, updated: id });
      }
      return NextResponse.json({ error: "AI specialization not found" }, { status: 404 });
    } else {
      // Insert (supports comma-separated names)
      const names = name.split(",").map((n: string) => n.trim()).filter(Boolean);
      const insertedIds = [];
      for (const singleName of names) {
        const maxId = data.AI_SPECIALIZATION.reduce((max: number, a: any) => (a.id > max ? a.id : max), 0);
        const newId = maxId + 1;
        data.AI_SPECIALIZATION.push({ id: newId, name: singleName });
        insertedIds.push(newId);
      }
      saveSkillsData(data);
      return NextResponse.json({ success: true, inserted: insertedIds });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
