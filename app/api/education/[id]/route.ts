import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getSkillsData();
    const originalLength = data.EDUCATION_ITEMS.length;
    data.EDUCATION_ITEMS = data.EDUCATION_ITEMS.filter((e: any) => e.id !== Number(id));
    
    if (data.EDUCATION_ITEMS.length < originalLength) {
      saveSkillsData(data);
      return NextResponse.json({ success: true, deleted: id });
    }
    return NextResponse.json({ error: "Education item not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
