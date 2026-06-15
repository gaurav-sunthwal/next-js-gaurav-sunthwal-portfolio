import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function GET() {
  try {
    const data = getSkillsData();
    return NextResponse.json(data.DATABASES);
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
      const index = data.DATABASES.findIndex((d: any) => d.id === Number(id));
      if (index !== -1) {
        data.DATABASES[index] = { id: Number(id), name };
        saveSkillsData(data);
        return NextResponse.json({ success: true, updated: id });
      }
      return NextResponse.json({ error: "Database not found" }, { status: 404 });
    } else {
      // Insert
      const maxId = data.DATABASES.reduce((max: number, d: any) => (d.id > max ? d.id : max), 0);
      const newId = maxId + 1;
      data.DATABASES.push({ id: newId, name });
      saveSkillsData(data);
      return NextResponse.json({ success: true, inserted: newId });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
