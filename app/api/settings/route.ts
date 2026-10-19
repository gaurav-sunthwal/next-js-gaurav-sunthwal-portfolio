import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { isSecretSetting } from "@/lib/site-settings";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    // Secrets (API keys etc.) are only returned to a logged-in admin.
    const isAdmin = !!(await getSession());
    const visible = (k: string) => isAdmin || !isSecretSetting(k);

    if (key) {
      if (!visible(key)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      const result = await db.select().from(settings).where(eq(settings.key, key));
      return NextResponse.json({ key, value: result[0]?.value ?? null });
    }

    const all = await db.select().from(settings);
    const mapped: Record<string, string> = {};
    for (const row of all) if (visible(row.key)) mapped[row.key] = row.value;
    return NextResponse.json(mapped);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function upsert(key: string, value: string) {
  await db
    .insert(settings)
    .values({ key, value })
    .onConflictDoUpdate({ target: settings.key, set: { value } });
}

/**
 * Save one setting:   { key, value }
 * Save many at once:  { values: { key: value, ... } }
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const entries: [string, string][] = body.values
      ? Object.entries(body.values as Record<string, unknown>).map(([k, v]) => [k, String(v ?? "")])
      : body.key && body.value !== undefined
        ? [[body.key, String(body.value)]]
        : [];

    if (entries.length === 0) {
      return NextResponse.json({ error: "Missing key or value" }, { status: 400 });
    }

    await Promise.all(entries.map(([k, v]) => upsert(k, v)));
    revalidatePath("/", "layout");
    return NextResponse.json({ success: true, saved: entries.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
