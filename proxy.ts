import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, verifySession } from "@/lib/session";

// Writes that visitors are allowed to make without logging in.
const PUBLIC_WRITES = ["/api/auth/login", "/api/auth/logout", "/api/contact"];
// Reads that only the admin may see.
const PRIVATE_READS = ["/api/admin", "/api/files", "/api/auth/users", "/api/google-photos"];

const matches = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(p + "/"));

/** Requires an admin session for every API write and for private reads. */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isRead = ["GET", "HEAD", "OPTIONS"].includes(request.method);

  const needsAuth = isRead ? matches(pathname, PRIVATE_READS) : !matches(pathname, PUBLIC_WRITES);
  if (!needsAuth) return NextResponse.next();

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
