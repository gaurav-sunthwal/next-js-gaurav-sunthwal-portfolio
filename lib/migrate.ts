// Additive migration for the redesign. Safe to run more than once:
// it only adds missing columns and never drops or rewrites data.
// Run with: pnpm db:migrate
import { config } from "dotenv";
config({ path: ".env.local" });

async function main() {
  const { db } = await import("./db");
  const { sql } = await import("drizzle-orm");

  const statements = [
    sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false`,
    sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS content text`,
    sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS youtube_url text`,
    sql`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS logo text`,
    sql`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS url text`,
    sql`ALTER TABLE skills ADD COLUMN IF NOT EXISTS icon text`,
    sql`ALTER TABLE education ADD COLUMN IF NOT EXISTS period text`,
    sql`ALTER TABLE education ADD COLUMN IF NOT EXISTS url text`,
    sql`CREATE TABLE IF NOT EXISTS memories (
      id serial PRIMARY KEY,
      url text NOT NULL,
      caption text NOT NULL DEFAULT '',
      taken_on text NOT NULL DEFAULT '',
      width integer NOT NULL DEFAULT 0,
      height integer NOT NULL DEFAULT 0,
      position integer NOT NULL DEFAULT 0,
      created_at timestamp NOT NULL DEFAULT now()
    )`,
    sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS deleted_at timestamp`,
    sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'upload'`,
    sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS source_id text`,
    sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS kind text NOT NULL DEFAULT 'photo'`,
    sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS poster text`,
    sql`ALTER TABLE memories ADD COLUMN IF NOT EXISTS duration integer NOT NULL DEFAULT 0`,
  ];

  for (const statement of statements) {
    await db.execute(statement);
  }
  console.log(`Migration complete (${statements.length} statements).`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
