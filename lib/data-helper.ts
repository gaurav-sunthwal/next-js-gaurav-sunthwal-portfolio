import fs from "fs";
import path from "path";

const jsonPath = path.join(process.cwd(), "lib/skills-data.json");

export function getSkillsData() {
  try {
    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading skills-data.json, returning default empty structure", error);
    return {
      TECHNICAL_CORE: [],
      AI_SPECIALIZATION: [],
      DATABASES: [],
      EDUCATION_ITEMS: [],
      CERTIFICATIONS: []
    };
  }
}

export function saveSkillsData(data: any) {
  try {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to skills-data.json", error);
    throw error;
  }
}
