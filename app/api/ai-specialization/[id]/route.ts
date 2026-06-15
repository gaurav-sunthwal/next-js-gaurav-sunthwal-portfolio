import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getSkillsData();
    const originalLength = data.AI_SPECIALIZATION.length;
    data.AI_SPECIALIZATION = data.AI_SPECIALIZATION.filter((a: any) => a.id !== Number(id));
    
    if (data.AI_SPECIALIZATION.length < originalLength) {
      saveSkillsData(data);
      return NextResponse.json({ success: true, deleted: id });
    }
    return NextResponse.json({ error: "AI specialization not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
