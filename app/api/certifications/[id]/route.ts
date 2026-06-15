import { NextResponse } from "next/server";
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = getSkillsData();
    const originalLength = data.CERTIFICATIONS.length;
    data.CERTIFICATIONS = data.CERTIFICATIONS.filter((c: any) => c.id !== Number(id));
    
    if (data.CERTIFICATIONS.length < originalLength) {
      saveSkillsData(data);
      return NextResponse.json({ success: true, deleted: id });
    }
    return NextResponse.json({ error: "Certification not found" }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
