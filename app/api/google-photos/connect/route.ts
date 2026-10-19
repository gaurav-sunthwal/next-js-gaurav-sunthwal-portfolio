import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { authUrl, isGooglePhotosConfigured } from "@/lib/google-photos";

// Admin-only (proxy.ts). Sends the admin to Google's sign-in page.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  if (!isGooglePhotosConfigured()) {
    return NextResponse.redirect(`${origin}/admin?tab=memories&google=not-configured`);
  }
  const state = randomUUID();
  const res = NextResponse.redirect(authUrl(origin, state));
  res.cookies.set("gp_oauth_state", state, { httpOnly: true, sameSite: "lax", secure: origin.startsWith("https"), maxAge: 600, path: "/" });
  return res;
}
