import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function GET() {
  try {
    const data = getSkillsData();
    return NextResponse.json(data.EDUCATION_ITEMS);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, degree, school, location, image } = body;

    if (!degree || !school || !location || !image) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const data = getSkillsData();
    if (id) {
      // Update
      const index = data.EDUCATION_ITEMS.findIndex((e: any) => e.id === Number(id));
      if (index !== -1) {
        data.EDUCATION_ITEMS[index] = { id: Number(id), degree, school, location, image };
        saveSkillsData(data);
        return NextResponse.json({ success: true, updated: id });
      }
      return NextResponse.json({ error: "Education item not found" }, { status: 404 });
    } else {
      // Insert
      const maxId = data.EDUCATION_ITEMS.reduce((max: number, e: any) => (e.id > max ? e.id : max), 0);
      const newId = maxId + 1;
      data.EDUCATION_ITEMS.push({ id: newId, degree, school, location, image });
      saveSkillsData(data);
      return NextResponse.json({ success: true, inserted: newId });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
