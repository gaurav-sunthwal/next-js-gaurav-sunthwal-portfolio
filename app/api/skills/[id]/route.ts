import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getSkillsData();
    const originalLength = data.TECHNICAL_CORE.length;
    data.TECHNICAL_CORE = data.TECHNICAL_CORE.filter((s: any) => s.id !== Number(id));
    
    if (data.TECHNICAL_CORE.length < originalLength) {
      saveSkillsData(data);
      return NextResponse.json({ success: true, deleted: id });
    }
    return NextResponse.json({ error: "Skill not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
