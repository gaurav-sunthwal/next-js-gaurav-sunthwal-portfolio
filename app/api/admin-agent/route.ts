import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  projects,
  experiences,
  education,
  certifications,
  settings,
} from "@/lib/schema";
import { getSkillsData } from "@/lib/data-helper";
import { eq, asc } from "drizzle-orm";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { SystemMessage, HumanMessage, AIMessage, ToolMessage } from "@langchain/core/messages";
import { tools, toolsMap } from "./tools";

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

    // Initialize LangChain Gemini model and bind tools
    const model = new ChatGoogleGenerativeAI({
      apiKey,
      model: "gemini-2.5-flash",
      temperature: 0.1,
    });

    const modelWithTools = model.bindTools(tools);

    // 2. Parse Messages History
    const body = await request.json();
    const { messages } = body; // Array of { role: 'user'|'model'|'assistant', content: string }

    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages structure" }, { status: 400 });
    }

    // Token efficiency: Limit history to last 10 messages to save context/token cost
    const recentMessages = messages.slice(-10);

    // Fetch all current portfolio data to provide context to the agent
    const allProj = await db.select().from(projects).orderBy(asc(projects.position));
    const allExp = await db.select().from(experiences);
    const skillsData = getSkillsData();
    const allEdu = await db.select().from(education);
    const allCerts = await db.select().from(certifications);
    const allSettings = await db.select().from(settings);

    const portfolioContextString = JSON.stringify(
      {
        projects: allProj,
        experience: allExp,
        skills: skillsData.TECHNICAL_CORE,
        education: allEdu,
        certifications: allCerts,
        settings: allSettings.reduce((acc, curr) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>),
      },
      null,
      2
    );

    // 3. Construct Message Array for LangChain
    const systemInstructionMessage = new SystemMessage(
      `You are the Portfolio Admin AI Assistant. Here is the current developer portfolio context:
${portfolioContextString}

You have tools to read, create, update, and delete all elements of this developer's portfolio (projects, experiences, skills, education, certifications, testimonials, settings). 
When a user asks to rewrite, generate, or suggest copy (like hero title or description suggestions, profile details, etc.), look at the current context of projects, experiences, and skills above to generate highly tailored, creative, professional suggestions.
When updating a project, note that 'links' is a structured array, but we have helper parameters 'demoUrl' and 'githubUrl' which we will map properly.

IMPORTANT TOOL CALLING RULE:
If you need to perform multiple database operations (e.g. adding multiple skills, database technologies, certifications, or experiences), you MUST generate all the required tool calls concurrently (in parallel) in a single turn/response. Do NOT call tools one-by-one in sequence across multiple turns. The system will execute all generated tool calls at the same time in parallel.

Keep your text answers short and focused. Always answer professionally.`
    );

    const langchainMessages = await Promise.all(
      recentMessages.map(async (m: any) => {
        if (m.role === "assistant" || m.role === "model") {
          return new AIMessage(m.content);
        }

        // If user message has an attachment, construct multimodal parts array
        if (m.attachment && m.attachment.url) {
          try {
            console.log(`[Admin Agent] Downloading attachment to pass to Gemini: ${m.attachment.name} (${m.attachment.type})`);
            const fileRes = await fetch(m.attachment.url);
            if (!fileRes.ok) {
              throw new Error(`Failed to fetch attachment from URL: ${m.attachment.url}`);
            }
            const buffer = await fileRes.arrayBuffer();
            const base64Data = Buffer.from(buffer).toString("base64");

            return new HumanMessage({
              content: [
                {
                  type: m.attachment.type, // e.g. "application/pdf" or "image/jpeg"
                  data: base64Data,
                },
                {
                  type: "text",
                  text: m.content,
                },
              ],
            });
          } catch (err: any) {
            console.error(`[Admin Agent] Error processing attachment:`, err);
            // Fallback to normal text message if download fails
            return new HumanMessage(m.content);
          }
        }

        return new HumanMessage(m.content);
      })
    );

    const executionHistory: any[] = [systemInstructionMessage, ...langchainMessages];

    // 4. Parallel-optimized Agent Execution Loop
    let attempts = 0;
    const maxAgentIterations = 5;
    let finalResponse = "";

    console.log(`[Admin Agent] Processing agent request. History length: ${langchainMessages.length}`);

    while (attempts < maxAgentIterations) {
      attempts++;
      console.log(`[Admin Agent] Loop iteration ${attempts}...`);

      // Invoke LLM to generate response or tool calls
      const aiMessage = await modelWithTools.invoke(executionHistory);

      // Check if the model wants to call tools
      if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        console.log(`[Admin Agent] Model generated ${aiMessage.tool_calls.length} tool call(s):`, aiMessage.tool_calls.map(tc => tc.name));
        executionHistory.push(aiMessage);

        // Execute all requested tool calls in parallel using Promise.all
        const toolResponses = await Promise.all(
          aiMessage.tool_calls.map(async (toolCall) => {
            console.log(`[Admin Agent] Executing tool: ${toolCall.name} with args:`, toolCall.args);
            const toolInstance = toolsMap[toolCall.name] as any;
            if (!toolInstance) {
              console.warn(`[Admin Agent] Tool ${toolCall.name} not found in toolsMap.`);
              return new ToolMessage({
                content: JSON.stringify({ error: `Tool ${toolCall.name} not found.` }),
                tool_call_id: toolCall.id!,
              });
            }

            try {
              const output = await toolInstance.invoke(toolCall.args);
              console.log(`[Admin Agent] Tool ${toolCall.name} completed successfully.`);
              return new ToolMessage({
                content: typeof output === "string" ? output : JSON.stringify(output),
                tool_call_id: toolCall.id!,
              });
            } catch (err: any) {
              console.error(`[Admin Agent] Tool ${toolCall.name} threw error:`, err);
              return new ToolMessage({
                content: JSON.stringify({ error: err.message || "Failed to execute database tool." }),
                tool_call_id: toolCall.id!,
              });
            }
          })
        );

        // Push tool responses to the chat execution history to let LLM see results
        executionHistory.push(...toolResponses);
      } else {
        // No tool calls: LLM finished reasoning and returned final text response
        let textContent = "";
        if (typeof aiMessage.content === "string") {
          textContent = aiMessage.content;
        } else if (Array.isArray(aiMessage.content)) {
          textContent = aiMessage.content
            .map((part) => (typeof part === "string" ? part : part.type === "text" ? (part as any).text : ""))
            .join("");
        }

        console.log(`[Admin Agent] Model finalized text response (length: ${textContent.length}):`, textContent);
        finalResponse = textContent;
        break;
      }
    }

    if (!finalResponse && attempts >= maxAgentIterations) {
      console.error("[Admin Agent] Max iterations exceeded without final response.");
      return NextResponse.json(
        { error: "Agent execution exceeded maximum safety iterations." },
        { status: 500 }
      );
    }

    return NextResponse.json({ response: finalResponse });
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
