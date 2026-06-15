import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:YVE4fgOC7fiBjNBg@db.yzzsadplqfgisftryvkq.supabase.co:5432/postgres";

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
