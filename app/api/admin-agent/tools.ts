import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  projects,
  experiences,
  skills,
  education,
  certifications,
  testimonials,
  aiSpecialization,
  databases,
  settings,
} from "@/lib/schema";
import { eq, asc } from "drizzle-orm";

// Helper function to stringify responses
const stringify = (val: any) => JSON.stringify(val);

// 1. Projects
export const listProjectsTool = tool(
  async () => {
    try {
      const allProj = await db.select().from(projects).orderBy(asc(projects.position));
      return stringify(allProj);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list projects" });
    }
  },
  {
    name: "list_projects",
    description: "Get a list of all portfolio projects.",
    schema: z.object({}),
  }
);

export const createOrUpdateProjectTool = tool(
  async ({ id, title, description, image, tags, type, demoUrl, screenshots, githubUrl }) => {
    try {
      const linksList = [];
      if (demoUrl) linksList.push({ label: "Live Demo", href: demoUrl, icon: "play_circle" });
      if (githubUrl) linksList.push({ label: "Source Code", href: githubUrl, icon: "code" });

      const existing = await db.select().from(projects).where(eq(projects.id, id));
      if (existing.length > 0) {
        await db
          .update(projects)
          .set({ title, description, image, tags, type, demoUrl, screenshots, links: linksList })
          .where(eq(projects.id, id));
        return stringify({ success: true, updated: id });
      } else {
        await db.insert(projects).values({
          id,
          title,
          description,
          image,
          tags: tags || [],
          type: type || "web",
          demoUrl: demoUrl || "",
          screenshots: screenshots || [],
          links: linksList,
        });
        return stringify({ success: true, inserted: id });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update project" });
    }
  },
  {
    name: "create_or_update_project",
    description: "Insert or update a portfolio project.",
    schema: z.object({
      id: z.string().describe("Unique slug identifier (e.g. 'my-cool-app'). Required."),
      title: z.string().describe("Title of the project. Required."),
      description: z.string().describe("Detailed description of the project. Required."),
      image: z.string().describe("Image URL for the card/thumbnail. Required."),
      tags: z.array(z.string()).optional().describe("Tags/technologies used."),
      type: z.string().optional().describe("Project type, e.g., 'web' or 'app'."),
      demoUrl: z.string().optional().describe("Live demonstration URL."),
      screenshots: z.array(z.string()).optional().describe("List of screenshot image URLs."),
      githubUrl: z.string().optional().describe("Source code repository URL."),
    }),
  }
);

export const deleteProjectTool = tool(
  async ({ id }) => {
    try {
      await db.delete(projects).where(eq(projects.id, id));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete project" });
    }
  },
  {
    name: "delete_project",
    description: "Delete a project by its unique slug ID.",
    schema: z.object({
      id: z.string().describe("The unique slug identifier of the project to delete."),
    }),
  }
);

// 2. Experiences
export const listExperiencesTool = tool(
  async () => {
    try {
      const allExp = await db.select().from(experiences);
      return stringify(allExp);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list experiences" });
    }
  },
  {
    name: "list_experiences",
    description: "Get a list of work experiences.",
    schema: z.object({}),
  }
);

export const createOrUpdateExperienceTool = tool(
  async ({ id, company, role, period, badge, badgeType, bullets, tech }) => {
    try {
      if (id) {
        await db
          .update(experiences)
          .set({ company, role, period, badge, badgeType, bullets, tech })
          .where(eq(experiences.id, id));
        return stringify({ success: true, updated: id });
      } else {
        await db.insert(experiences).values({ company, role, period, badge, badgeType, bullets, tech });
        return stringify({ success: true, inserted: true });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update experience" });
    }
  },
  {
    name: "create_or_update_experience",
    description: "Add or update work experience.",
    schema: z.object({
      id: z.number().optional().describe("Optional numeric ID. If specified, updates the experience; otherwise inserts."),
      company: z.string().describe("Company name. Required."),
      role: z.string().describe("Role title. Required."),
      period: z.string().describe("Duration (e.g. 'Oct 2023 - Present'). Required."),
      badge: z.string().describe("Badge text, e.g. 'Full-time'. Required."),
      badgeType: z.string().describe("Badge styling category, e.g. 'primary' or 'secondary'. Required."),
      bullets: z.array(z.string()).describe("List of accomplishments. Required."),
      tech: z.array(z.string()).describe("Technologies utilized. Required."),
    }),
  }
);

export const deleteExperienceTool = tool(
  async ({ id }) => {
    try {
      await db.delete(experiences).where(eq(experiences.id, id));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete experience" });
    }
  },
  {
    name: "delete_experience",
    description: "Delete a work experience record by ID.",
    schema: z.object({
      id: z.number().describe("Numeric experience ID."),
    }),
  }
);

// 3. Skills
export const listSkillsTool = tool(
  async () => {
    try {
      const allSkills = await db.select().from(skills);
      return stringify(allSkills);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list skills" });
    }
  },
  {
    name: "list_skills",
    description: "List technical skills.",
    schema: z.object({}),
  }
);

export const createOrUpdateSkillTool = tool(
  async ({ id, name, subtitle }) => {
    try {
      const parsedId = id ? Number(id) : undefined;
      if (parsedId) {
        await db.update(skills).set({ name, subtitle }).where(eq(skills.id, parsedId));
        return stringify({ success: true, updated: parsedId });
      } else {
        const existingList = await db.select().from(skills);
        const existing = existingList.find(s => s.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          const currentSkills = existing.subtitle.split(",").map(s => s.trim()).filter(Boolean);
          const newSkills = subtitle.split(",").map(s => s.trim()).filter(Boolean);
          const mergedSkills = Array.from(new Set([...currentSkills, ...newSkills]));
          
          await db
            .update(skills)
            .set({ subtitle: mergedSkills.join(", ") })
            .where(eq(skills.id, existing.id));
            
          return stringify({ success: true, updated: existing.id, message: "Merged into existing skill category" });
        }

        const inserted = await db.insert(skills).values({ name, subtitle }).returning({ id: skills.id });
        return stringify({ success: true, inserted: inserted[0]?.id });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update skill" });
    }
  },
  {
    name: "create_or_update_skill",
    description: "Add or update technical skill. Updates the JSON-based skills store.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).optional().describe("Optional numeric ID. If provided, updates existing; otherwise adds new."),
      name: z.string().describe("Skill category name (e.g. 'Languages'). Required."),
      subtitle: z.string().describe("Comma-separated list of skills under this category (e.g. 'TS, JS, Python'). Required."),
    }),
  }
);

export const deleteSkillTool = tool(
  async ({ id }) => {
    try {
      await db.delete(skills).where(eq(skills.id, Number(id)));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete skill" });
    }
  },
  {
    name: "delete_skill",
    description: "Delete technical skill category by ID.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).describe("Numeric skill ID."),
    }),
  }
);

// 4. Education
export const listEducationTool = tool(
  async () => {
    try {
      const allEdu = await db.select().from(education);
      return stringify(allEdu);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list education" });
    }
  },
  {
    name: "list_education",
    description: "Get list of education history.",
    schema: z.object({}),
  }
);

export const createOrUpdateEducationTool = tool(
  async ({ id, degree, school, location, image }) => {
    try {
      if (id) {
        await db
          .update(education)
          .set({ degree, school, location, image })
          .where(eq(education.id, id));
        return stringify({ success: true, updated: id });
      } else {
        await db.insert(education).values({ degree, school, location, image });
        return stringify({ success: true, inserted: true });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update education" });
    }
  },
  {
    name: "create_or_update_education",
    description: "Add or update education entry.",
    schema: z.object({
      id: z.number().optional().describe("Optional numeric ID. Updates if specified, else inserts."),
      degree: z.string().describe("Degree / Certificate title. Required."),
      school: z.string().describe("School / Institution. Required."),
      location: z.string().describe("Location name. Required."),
      image: z.string().describe("School logo URL. Required."),
    }),
  }
);

export const deleteEducationTool = tool(
  async ({ id }) => {
    try {
      await db.delete(education).where(eq(education.id, id));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete education" });
    }
  },
  {
    name: "delete_education",
    description: "Delete education history entry by ID.",
    schema: z.object({
      id: z.number().describe("Numeric ID."),
    }),
  }
);

// 5. Certifications
export const listCertificationsTool = tool(
  async () => {
    try {
      const allCerts = await db.select().from(certifications);
      return stringify(allCerts);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list certifications" });
    }
  },
  {
    name: "list_certifications",
    description: "List all professional certifications.",
    schema: z.object({}),
  }
);

export const createOrUpdateCertificationTool = tool(
  async ({ id, title, subtitle }) => {
    try {
      if (id) {
        await db
          .update(certifications)
          .set({ title, subtitle })
          .where(eq(certifications.id, id));
        return stringify({ success: true, updated: id });
      } else {
        const existingList = await db.select().from(certifications);
        const existing = existingList.find(c => c.title.toLowerCase() === title.toLowerCase());
        if (existing) {
          return stringify({ success: true, message: "Certification already exists", id: existing.id });
        }
        await db.insert(certifications).values({ title, subtitle });
        return stringify({ success: true, inserted: true });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update certification" });
    }
  },
  {
    name: "create_or_update_certification",
    description: "Add or update a certification.",
    schema: z.object({
      id: z.number().optional().describe("Optional numeric ID. Updates if specified, else inserts."),
      title: z.string().describe("Title of certification. Required."),
      subtitle: z.string().describe("Credential ID / Provider. Required."),
    }),
  }
);

export const deleteCertificationTool = tool(
  async ({ id }) => {
    try {
      await db.delete(certifications).where(eq(certifications.id, id));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete certification" });
    }
  },
  {
    name: "delete_certification",
    description: "Delete a certification by ID.",
    schema: z.object({
      id: z.number().describe("Numeric certification ID."),
    }),
  }
);

// 6. AI Specializations
export const listAiSpecializationsTool = tool(
  async () => {
    try {
      const allAiSpecs = await db.select().from(aiSpecialization);
      return stringify(allAiSpecs);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list AI specializations" });
    }
  },
  {
    name: "list_ai_specializations",
    description: "List AI core specialization topics.",
    schema: z.object({}),
  }
);

export const createOrUpdateAiSpecializationTool = tool(
  async ({ id, name }) => {
    try {
      const parsedId = id ? Number(id) : undefined;
      if (parsedId) {
        await db.update(aiSpecialization).set({ name }).where(eq(aiSpecialization.id, parsedId));
        return stringify({ success: true, updated: parsedId });
      } else {
        const names = name.split(",").map((n) => n.trim()).filter(Boolean);
        const insertedIds = [];
        
        const existingList = await db.select().from(aiSpecialization);
        
        for (const singleName of names) {
          const existing = existingList.find(a => a.name.toLowerCase() === singleName.toLowerCase());
          if (existing) {
            insertedIds.push(existing.id);
            continue;
          }
          const inserted = await db.insert(aiSpecialization).values({ name: singleName }).returning({ id: aiSpecialization.id });
          insertedIds.push(inserted[0]?.id);
        }
        return stringify({ success: true, inserted: insertedIds });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update AI specialization" });
    }
  },
  {
    name: "create_or_update_ai_specialization",
    description: "Add or update an AI specialization topic. You can pass multiple comma-separated names (e.g. 'LangChain, LangGraph') to add multiple items at once when inserting.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).optional().describe("Optional numeric ID. Updates if specified, else inserts."),
      name: z.string().describe("Topic name or comma-separated list of names. Required."),
    }),
  }
);

export const deleteAiSpecializationTool = tool(
  async ({ id }) => {
    try {
      await db.delete(aiSpecialization).where(eq(aiSpecialization.id, Number(id)));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete AI specialization" });
    }
  },
  {
    name: "delete_ai_specialization",
    description: "Delete an AI specialization topic by ID.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).describe("Numeric ID."),
    }),
  }
);

// 7. Databases
export const listDatabasesTool = tool(
  async () => {
    try {
      const allDbs = await db.select().from(databases);
      return stringify(allDbs);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list databases" });
    }
  },
  {
    name: "list_databases",
    description: "List databases technologies configured.",
    schema: z.object({}),
  }
);

export const createOrUpdateDatabaseTool = tool(
  async ({ id, name }) => {
    try {
      const parsedId = id ? Number(id) : undefined;
      if (parsedId) {
        await db.update(databases).set({ name }).where(eq(databases.id, parsedId));
        return stringify({ success: true, updated: parsedId });
      } else {
        const names = name.split(",").map((n) => n.trim()).filter(Boolean);
        const insertedIds = [];
        
        const existingList = await db.select().from(databases);
        
        for (const singleName of names) {
          const existing = existingList.find(d => d.name.toLowerCase() === singleName.toLowerCase());
          if (existing) {
            insertedIds.push(existing.id);
            continue;
          }
          const inserted = await db.insert(databases).values({ name: singleName }).returning({ id: databases.id });
          insertedIds.push(inserted[0]?.id);
        }
        return stringify({ success: true, inserted: insertedIds });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update database" });
    }
  },
  {
    name: "create_or_update_database",
    description: "Add or update database technology. You can pass multiple comma-separated names (e.g. 'MongoDB, Redis') to add multiple items at once when inserting.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).optional().describe("Optional ID."),
      name: z.string().describe("Database name or comma-separated list of names. Required."),
    }),
  }
);

export const deleteDatabaseTool = tool(
  async ({ id }) => {
    try {
      await db.delete(databases).where(eq(databases.id, Number(id)));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete database" });
    }
  },
  {
    name: "delete_database",
    description: "Delete database entry by ID.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).describe("Numeric ID."),
    }),
  }
);

// 8. Testimonials
export const listTestimonialsTool = tool(
  async () => {
    try {
      const allTestimonials = await db.select().from(testimonials);
      return stringify(allTestimonials);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list testimonials" });
    }
  },
  {
    name: "list_testimonials",
    description: "List all professional testimonials / reviews.",
    schema: z.object({}),
  }
);

export const createOrUpdateTestimonialTool = tool(
  async ({ id, role, company, avatar, quote }) => {
    try {
      const parsedId = id ? Number(id) : undefined;
      if (parsedId) {
        await db.update(testimonials).set({ role, company, avatar, quote }).where(eq(testimonials.id, parsedId));
        return stringify({ success: true, updated: parsedId });
      } else {
        const inserted = await db.insert(testimonials).values({ role, company, avatar, quote }).returning({ id: testimonials.id });
        return stringify({ success: true, inserted: inserted[0]?.id });
      }
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to create or update testimonial" });
    }
  },
  {
    name: "create_or_update_testimonial",
    description: "Add or update a testimonial entry.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).optional().describe("Optional numeric ID. If specified, updates the testimonial; otherwise inserts a new one."),
      role: z.string().describe("Role / job title of the reviewer. Required."),
      company: z.string().describe("Company of the reviewer. Required."),
      avatar: z.string().describe("Avatar character/initial or image URL. Required."),
      quote: z.string().describe("Review / testimonial text quote. Required."),
    }),
  }
);

export const deleteTestimonialTool = tool(
  async ({ id }) => {
    try {
      await db.delete(testimonials).where(eq(testimonials.id, Number(id)));
      return stringify({ success: true, deleted: id });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to delete testimonial" });
    }
  },
  {
    name: "delete_testimonial",
    description: "Delete a testimonial entry by ID.",
    schema: z.object({
      id: z.union([z.number(), z.string()]).describe("Numeric ID of the testimonial to delete."),
    }),
  }
);

// 9. Resume URL / Settings
export const getResumeUrlTool = tool(
  async () => {
    try {
      const res = await db.select().from(settings).where(eq(settings.key, "resume_url"));
      return stringify(res.length > 0 ? { url: res[0].value } : { url: "" });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to get resume URL" });
    }
  },
  {
    name: "get_resume_url",
    description: "Retrieve the current uploaded resume URL.",
    schema: z.object({}),
  }
);

export const updateResumeUrlTool = tool(
  async ({ url }) => {
    try {
      const existing = await db.select().from(settings).where(eq(settings.key, "resume_url"));
      if (existing.length > 0) {
        await db.update(settings).set({ value: url }).where(eq(settings.key, "resume_url"));
      } else {
        await db.insert(settings).values({ key: "resume_url", value: url });
      }
      return stringify({ success: true, url });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to update resume URL" });
    }
  },
  {
    name: "update_resume_url",
    description: "Set or update the resume URL.",
    schema: z.object({
      url: z.string().describe("The resume URL link. Required."),
    }),
  }
);

export const listSettingsTool = tool(
  async () => {
    try {
      const allSettings = await db.select().from(settings);
      const resObj = allSettings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>);
      return stringify(resObj);
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to list settings" });
    }
  },
  {
    name: "list_settings",
    description: "Get all settings key-value pairs (which control homepage text content like hero_title, cta_title, etc.).",
    schema: z.object({}),
  }
);

export const updateSettingTool = tool(
  async ({ key, value }) => {
    try {
      const existing = await db.select().from(settings).where(eq(settings.key, key));
      if (existing.length > 0) {
        await db.update(settings).set({ value }).where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
      return stringify({ success: true, key, value });
    } catch (err: any) {
      return stringify({ error: err.message || "Failed to update setting" });
    }
  },
  {
    name: "update_setting",
    description: "Set or update a setting value (e.g. to change homepage texts like hero_title, hero_description, cta_title, etc.).",
    schema: z.object({
      key: z.string().describe("The setting key to update (e.g. 'hero_title', 'hero_description', 'cta_title', etc.). Required."),
      value: z.string().describe("The new text value. Required."),
    }),
  }
);

// Map array of all tools
export const tools = [
  listProjectsTool,
  createOrUpdateProjectTool,
  deleteProjectTool,
  listExperiencesTool,
  createOrUpdateExperienceTool,
  deleteExperienceTool,
  listSkillsTool,
  createOrUpdateSkillTool,
  deleteSkillTool,
  listEducationTool,
  createOrUpdateEducationTool,
  deleteEducationTool,
  listCertificationsTool,
  createOrUpdateCertificationTool,
  deleteCertificationTool,
  listAiSpecializationsTool,
  createOrUpdateAiSpecializationTool,
  deleteAiSpecializationTool,
  listDatabasesTool,
  createOrUpdateDatabaseTool,
  deleteDatabaseTool,
  listTestimonialsTool,
  createOrUpdateTestimonialTool,
  deleteTestimonialTool,
  getResumeUrlTool,
  updateResumeUrlTool,
  listSettingsTool,
  updateSettingTool,
];

// Helper map to lookup tools by name
export const toolsMap = tools.reduce((acc, currentTool) => {
  acc[currentTool.name] = currentTool;
  return acc;
}, {} as Record<string, typeof tools[number]>);
