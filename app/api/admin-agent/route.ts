import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
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
import { getSkillsData, saveSkillsData } from "@/lib/data-helper";
import { eq, asc } from "drizzle-orm";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    // 1. Verify Authorization
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      const setting = await db.select().from(settings).where(eq(settings.key, "gemini_api_key"));
      if (setting.length > 0) {
        apiKey = setting[0].value;
      }
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: "NO_API_KEY", message: "Please configure your Gemini API Key." },
        { status: 400 }
      );
    }

    // Initialize Gemini Client
    const ai = new GoogleGenAI({ apiKey });

    // 2. Parse Messages History
    const body = await request.json();
    const { messages } = body; // Array of { role: 'user'|'model', content: string }

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages structure" }, { status: 400 });
    }

    // Token efficiency: Limit history to last 10 messages to save context/token cost
    const recentMessages = messages.slice(-10);

    // Convert messages to Gemini format: { role: 'user' | 'model', parts: [{ text: string }] }
    // Note: Gemini API expects roles to be 'user' or 'model'
    const contents = recentMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    // 3. Define Tools / Function Declarations
    const tools = [
      {
        functionDeclarations: [
          // Projects
          {
            name: "list_projects",
            description: "Get a list of all portfolio projects.",
          },
          {
            name: "create_or_update_project",
            description: "Insert or update a portfolio project.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING", description: "Unique slug identifier (e.g. 'my-cool-app'). Required." },
                title: { type: "STRING", description: "Title of the project. Required." },
                description: { type: "STRING", description: "Detailed description of the project. Required." },
                image: { type: "STRING", description: "Image URL for the card/thumbnail. Required." },
                tags: { type: "ARRAY", items: { type: "STRING" }, description: "Tags/technologies used." },
                type: { type: "STRING", description: "Project type, e.g., 'web' or 'app'." },
                demoUrl: { type: "STRING", description: "Live demonstration URL." },
                screenshots: { type: "ARRAY", items: { type: "STRING" }, description: "List of screenshot image URLs." },
                githubUrl: { type: "STRING", description: "Source code repository URL." },
              },
              required: ["id", "title", "description", "image"],
            },
          },
          {
            name: "delete_project",
            description: "Delete a project by its unique slug ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "STRING", description: "The unique slug identifier of the project to delete." },
              },
              required: ["id"],
            },
          },
          // Experiences
          {
            name: "list_experiences",
            description: "Get a list of work experiences.",
          },
          {
            name: "create_or_update_experience",
            description: "Add or update work experience.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Optional numeric ID. If specified, updates the experience; otherwise inserts." },
                company: { type: "STRING", description: "Company name. Required." },
                role: { type: "STRING", description: "Role title. Required." },
                period: { type: "STRING", description: "Duration (e.g. 'Oct 2023 - Present'). Required." },
                badge: { type: "STRING", description: "Badge text, e.g. 'Full-time'. Required." },
                badgeType: { type: "STRING", description: "Badge styling category, e.g. 'primary' or 'secondary'. Required." },
                bullets: { type: "ARRAY", items: { type: "STRING" }, description: "List of accomplishments. Required." },
                tech: { type: "ARRAY", items: { type: "STRING" }, description: "Technologies utilized. Required." },
              },
              required: ["company", "role", "period", "badge", "badgeType", "bullets", "tech"],
            },
          },
          {
            name: "delete_experience",
            description: "Delete a work experience record by ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Numeric experience ID." },
              },
              required: ["id"],
            },
          },
          // Skills
          {
            name: "list_skills",
            description: "List technical skills.",
          },
          {
            name: "create_or_update_skill",
            description: "Add or update technical skill. Updates the JSON-based skills store.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Optional numeric ID. If provided, updates existing; otherwise adds new." },
                name: { type: "STRING", description: "Skill category name (e.g. 'Languages'). Required." },
                subtitle: { type: "STRING", description: "Comma-separated list of skills under this category (e.g. 'TS, JS, Python'). Required." },
              },
              required: ["name", "subtitle"],
            },
          },
          {
            name: "delete_skill",
            description: "Delete technical skill category by ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Numeric skill ID." },
              },
              required: ["id"],
            },
          },
          // Education
          {
            name: "list_education",
            description: "Get list of education history.",
          },
          {
            name: "create_or_update_education",
            description: "Add or update education entry.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Optional numeric ID. Updates if specified, else inserts." },
                degree: { type: "STRING", description: "Degree / Certificate title. Required." },
                school: { type: "STRING", description: "School / Institution. Required." },
                location: { type: "STRING", description: "Location name. Required." },
                image: { type: "STRING", description: "School logo URL. Required." },
              },
              required: ["degree", "school", "location", "image"],
            },
          },
          {
            name: "delete_education",
            description: "Delete education history entry by ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Numeric ID." },
              },
              required: ["id"],
            },
          },
          // Certifications
          {
            name: "list_certifications",
            description: "List all professional certifications.",
          },
          {
            name: "create_or_update_certification",
            description: "Add or update a certification.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Optional numeric ID. Updates if specified, else inserts." },
                title: { type: "STRING", description: "Title of certification. Required." },
                subtitle: { type: "STRING", description: "Credential ID / Provider. Required." },
              },
              required: ["title", "subtitle"],
            },
          },
          {
            name: "delete_certification",
            description: "Delete a certification by ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Numeric certification ID." },
              },
              required: ["id"],
            },
          },
          // AI Specialization & Databases
          {
            name: "list_ai_specializations",
            description: "List AI core specialization topics.",
          },
          {
            name: "create_or_update_ai_specialization",
            description: "Add or update an AI specialization topic. You can pass multiple comma-separated names (e.g. 'LangChain, LangGraph') to add multiple items at once when inserting.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Optional numeric ID. Updates if specified, else inserts." },
                name: { type: "STRING", description: "Topic name or comma-separated list of names. Required." },
              },
              required: ["name"],
            },
          },
          {
            name: "delete_ai_specialization",
            description: "Delete an AI specialization topic by ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Numeric ID." },
              },
              required: ["id"],
            },
          },
          {
            name: "list_databases",
            description: "List databases technologies configured.",
          },
          {
            name: "create_or_update_database",
            description: "Add or update database technology. You can pass multiple comma-separated names (e.g. 'MongoDB, Redis') to add multiple items at once when inserting.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Optional ID." },
                name: { type: "STRING", description: "Database name or comma-separated list of names. Required." },
              },
              required: ["name"],
            },
          },
          {
            name: "delete_database",
            description: "Delete database entry by ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Numeric ID." },
              },
              required: ["id"],
            },
          },
          // Testimonials
          {
            name: "list_testimonials",
            description: "List all professional testimonials / reviews.",
          },
          {
            name: "create_or_update_testimonial",
            description: "Add or update a testimonial entry.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Optional numeric ID. If specified, updates the testimonial; otherwise inserts a new one." },
                role: { type: "STRING", description: "Role / job title of the reviewer. Required." },
                company: { type: "STRING", description: "Company of the reviewer. Required." },
                avatar: { type: "STRING", description: "Avatar character/initial or image URL. Required." },
                quote: { type: "STRING", description: "Review / testimonial text quote. Required." },
              },
              required: ["role", "company", "avatar", "quote"],
            },
          },
          {
            name: "delete_testimonial",
            description: "Delete a testimonial entry by ID.",
            parameters: {
              type: "OBJECT",
              properties: {
                id: { type: "INTEGER", description: "Numeric ID of the testimonial to delete." },
              },
              required: ["id"],
            },
          },
          // Resume URL / Settings
          {
            name: "get_resume_url",
            description: "Retrieve the current uploaded resume URL.",
          },
          {
            name: "update_resume_url",
            description: "Set or update the resume URL.",
            parameters: {
              type: "OBJECT",
              properties: {
                url: { type: "STRING", description: "The resume URL link. Required." },
              },
              required: ["url"],
            },
          },
          {
            name: "list_settings",
            description: "Get all settings key-value pairs (which control homepage text content like hero_title, cta_title, etc.).",
          },
          {
            name: "update_setting",
            description: "Set or update a setting value (e.g. to change homepage texts like hero_title, hero_description, cta_title, etc.).",
            parameters: {
              type: "OBJECT",
              properties: {
                key: { type: "STRING", description: "The setting key to update (e.g. 'hero_title', 'hero_description', 'cta_title', etc.). Required." },
                value: { type: "STRING", description: "The new text value. Required." },
              },
              required: ["key", "value"],
            },
          },
        ],
      },
    ];

    // 4. Multi-turn Agent loop to resolve functions locally
    let currentContents: any[] = [...contents];
    let attempts = 0;
    const maxAgentIterations = 5;

    // Fetch all current portfolio data to provide context to the agent
    const allProj = await db.select().from(projects).orderBy(asc(projects.position));
    const allExp = await db.select().from(experiences);
    const skillsData = getSkillsData();
    const allEdu = await db.select().from(education);
    const allCerts = await db.select().from(certifications);
    const allSettings = await db.select().from(settings);

    const portfolioContextString = JSON.stringify({
      projects: allProj,
      experience: allExp,
      skills: skillsData.TECHNICAL_CORE,
      education: allEdu,
      certifications: allCerts,
      settings: allSettings.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, string>),
    }, null, 2);

    while (attempts < maxAgentIterations) {
      attempts++;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: currentContents,
        config: {
          systemInstruction: `You are the Portfolio Admin AI Assistant. Here is the current developer portfolio context:
${portfolioContextString}

You have tools to read, create, update, and delete all elements of this developer's portfolio (projects, experiences, skills, education, certifications, testimonials, settings). 
When a user asks to rewrite, generate, or suggest copy (like hero title or description suggestions, profile details, etc.), look at the current context of projects, experiences, and skills above to generate highly tailored, creative, professional suggestions.
When updating a project, note that 'links' is a structured array, but we have helper parameters 'demoUrl' and 'githubUrl' which we will map properly.
Keep your text answers short and focused. Always answer professionally.`,
          tools: tools as any,
        },
      });

      const candidate = geminiResponse.candidates?.[0];
      const functionCalls = candidate?.content?.parts?.filter((p) => p.functionCall);

      if (!functionCalls || functionCalls.length === 0) {
        // No function calls, this is the final response. Return to user
        const responseText = candidate?.content?.parts?.map((p) => p.text).join("") || "Done.";
        return NextResponse.json({ response: responseText });
      }

      // We have function calls! We need to execute them and push the results back.
      // Append the model's message containing the function calls
      currentContents.push({
        role: "model",
        parts: candidate?.content?.parts,
      });

      const toolResponseParts = [];

      for (const call of functionCalls) {
        const { name, args } = call.functionCall!;
        let result: any;

        try {
          switch (name) {
            // Projects
            case "list_projects":
              result = await db.select().from(projects).orderBy(asc(projects.position));
              break;

            case "create_or_update_project": {
              const { id, title, description, image, tags, type, demoUrl, screenshots, githubUrl } = args as any;
              
              // Prepare links
              const linksList = [];
              if (demoUrl) linksList.push({ label: "Live Demo", href: demoUrl, icon: "play_circle" });
              if (githubUrl) linksList.push({ label: "Source Code", href: githubUrl, icon: "code" });

              const existing = await db.select().from(projects).where(eq(projects.id, id));
              if (existing.length > 0) {
                await db
                  .update(projects)
                  .set({ title, description, image, tags, type, demoUrl, screenshots, links: linksList })
                  .where(eq(projects.id, id));
                result = { success: true, updated: id };
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
                result = { success: true, inserted: id };
              }
              break;
            }

            case "delete_project":
              await db.delete(projects).where(eq(projects.id, (args as any).id));
              result = { success: true, deleted: (args as any).id };
              break;

            // Experiences
            case "list_experiences":
              result = await db.select().from(experiences);
              break;

            case "create_or_update_experience": {
              const { id, company, role, period, badge, badgeType, bullets, tech } = args as any;
              if (id) {
                await db
                  .update(experiences)
                  .set({ company, role, period, badge, badgeType, bullets, tech })
                  .where(eq(experiences.id, id));
                result = { success: true, updated: id };
              } else {
                await db.insert(experiences).values({ company, role, period, badge, badgeType, bullets, tech });
                result = { success: true, inserted: true };
              }
              break;
            }

            case "delete_experience":
              await db.delete(experiences).where(eq(experiences.id, (args as any).id));
              result = { success: true, deleted: (args as any).id };
              break;

            // Skills
            case "list_skills":
              result = await db.select().from(skills);
              break;

            case "create_or_update_skill": {
              const { id, name, subtitle } = args as any;
              if (id) {
                await db.update(skills).set({ name, subtitle }).where(eq(skills.id, Number(id)));
                result = { success: true, updated: id };
              } else {
                const inserted = await db.insert(skills).values({ name, subtitle }).returning({ id: skills.id });
                result = { success: true, inserted: inserted[0]?.id };
              }
              break;
            }

            case "delete_skill": {
              const { id } = args as any;
              await db.delete(skills).where(eq(skills.id, Number(id)));
              result = { success: true, deleted: id };
              break;
            }

            // Education
            case "list_education":
              result = await db.select().from(education);
              break;

            case "create_or_update_education": {
              const { id, degree, school, location, image } = args as any;
              if (id) {
                await db
                  .update(education)
                  .set({ degree, school, location, image })
                  .where(eq(education.id, id));
                result = { success: true, updated: id };
              } else {
                await db.insert(education).values({ degree, school, location, image });
                result = { success: true, inserted: true };
              }
              break;
            }

            case "delete_education":
              await db.delete(education).where(eq(education.id, (args as any).id));
              result = { success: true, deleted: (args as any).id };
              break;

            // Certifications
            case "list_certifications":
              result = await db.select().from(certifications);
              break;

            case "create_or_update_certification": {
              const { id, title, subtitle } = args as any;
              if (id) {
                await db
                  .update(certifications)
                  .set({ title, subtitle })
                  .where(eq(certifications.id, id));
                result = { success: true, updated: id };
              } else {
                await db.insert(certifications).values({ title, subtitle });
                result = { success: true, inserted: true };
              }
              break;
            }

            case "delete_certification":
              await db.delete(certifications).where(eq(certifications.id, (args as any).id));
              result = { success: true, deleted: (args as any).id };
              break;

            // AI Specializations
            case "list_ai_specializations":
              result = await db.select().from(aiSpecialization);
              break;

            case "create_or_update_ai_specialization": {
              const { id, name } = args as any;
              if (id) {
                await db.update(aiSpecialization).set({ name }).where(eq(aiSpecialization.id, Number(id)));
                result = { success: true, updated: id };
              } else {
                const names = name.split(",").map((n: string) => n.trim()).filter(Boolean);
                const insertedIds = [];
                for (const singleName of names) {
                  const inserted = await db.insert(aiSpecialization).values({ name: singleName }).returning({ id: aiSpecialization.id });
                  insertedIds.push(inserted[0]?.id);
                }
                result = { success: true, inserted: insertedIds };
              }
              break;
            }

            case "delete_ai_specialization": {
              const { id } = args as any;
              await db.delete(aiSpecialization).where(eq(aiSpecialization.id, Number(id)));
              result = { success: true, deleted: id };
              break;
            }

            // Databases
            case "list_databases":
              result = await db.select().from(databases);
              break;

            case "create_or_update_database": {
              const { id, name } = args as any;
              if (id) {
                await db.update(databases).set({ name }).where(eq(databases.id, Number(id)));
                result = { success: true, updated: id };
              } else {
                const names = name.split(",").map((n: string) => n.trim()).filter(Boolean);
                const insertedIds = [];
                for (const singleName of names) {
                  const inserted = await db.insert(databases).values({ name: singleName }).returning({ id: databases.id });
                  insertedIds.push(inserted[0]?.id);
                }
                result = { success: true, inserted: insertedIds };
              }
              break;
            }

            case "delete_database": {
              const { id } = args as any;
              await db.delete(databases).where(eq(databases.id, Number(id)));
              result = { success: true, deleted: id };
              break;
            }

            // Testimonials
            case "list_testimonials": {
              result = await db.select().from(testimonials);
              break;
            }

            case "create_or_update_testimonial": {
              const { id, role, company, avatar, quote } = args as any;
              if (id) {
                await db.update(testimonials).set({ role, company, avatar, quote }).where(eq(testimonials.id, Number(id)));
                result = { success: true, updated: id };
              } else {
                const inserted = await db.insert(testimonials).values({ role, company, avatar, quote }).returning({ id: testimonials.id });
                result = { success: true, inserted: inserted[0]?.id };
              }
              break;
            }

            case "delete_testimonial": {
              const { id } = args as any;
              await db.delete(testimonials).where(eq(testimonials.id, Number(id)));
              result = { success: true, deleted: id };
              break;
            }

            // Resume URL
            case "get_resume_url": {
              const res = await db.select().from(settings).where(eq(settings.key, "resume_url"));
              result = res.length > 0 ? { url: res[0].value } : { url: "" };
              break;
            }

            case "update_resume_url": {
              const { url } = args as any;
              const existing = await db.select().from(settings).where(eq(settings.key, "resume_url"));
              if (existing.length > 0) {
                await db.update(settings).set({ value: url }).where(eq(settings.key, "resume_url"));
              } else {
                await db.insert(settings).values({ key: "resume_url", value: url });
              }
              result = { success: true, url };
              break;
            }

            case "list_settings": {
              const allSettings = await db.select().from(settings);
              result = allSettings.reduce((acc, curr) => {
                acc[curr.key] = curr.value;
                return acc;
              }, {} as Record<string, string>);
              break;
            }

            case "update_setting": {
              const { key, value } = args as any;
              const existing = await db.select().from(settings).where(eq(settings.key, key));
              if (existing.length > 0) {
                await db.update(settings).set({ value }).where(eq(settings.key, key));
              } else {
                await db.insert(settings).values({ key, value });
              }
              result = { success: true, key, value };
              break;
            }

            default:
              result = { error: `Tool ${name} is not implemented.` };
          }
        } catch (err: any) {
          result = { error: err.message || "Failed to execute database tool." };
        }

        toolResponseParts.push({
          functionResponse: {
            name,
            response: { result },
          },
        });
      }

      // Add tool output responses to thread and proceed
      currentContents.push({
        role: "user",
        parts: toolResponseParts,
      });
    }

    return NextResponse.json(
      { error: "Agent execution exceeded maximum safety iterations." },
      { status: 500 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let apiKey = process.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      const setting = await db.select().from(settings).where(eq(settings.key, "gemini_api_key"));
      if (setting.length > 0) {
        apiKey = setting[0].value;
      }
    }

    return NextResponse.json({ hasKey: !!apiKey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
