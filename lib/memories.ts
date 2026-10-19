import "server-only";
import { isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { memories } from "@/lib/schema";

/** Position after the last visible memory, so new photos go to the end. */
export async function nextMemoryPosition() {
  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${memories.position}), -1)` })
    .from(memories)
    .where(isNull(memories.deletedAt));
  return Number(max) + 1;
}
