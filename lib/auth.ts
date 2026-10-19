import { cookies } from "next/headers";
import { COOKIE_NAME, verifySession, type SessionPayload } from "./session";

export { createSession, verifySession, COOKIE_NAME, COOKIE_MAX_AGE } from "./session";
export type { SessionPayload } from "./session";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}
