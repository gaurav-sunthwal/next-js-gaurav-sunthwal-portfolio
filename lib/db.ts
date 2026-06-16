import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_4PAcYiOB0yGL@ep-restless-night-aij9gpij-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
