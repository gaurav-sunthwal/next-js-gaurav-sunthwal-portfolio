import { NextResponse } from "next/server";
import { isGooglePhotosConfigured, isGooglePhotosConnected, redirectUri } from "@/lib/google-photos";

export const dynamic = "force-dynamic";

// Admin-only (proxy.ts). Tells the admin panel whether setup is done.
export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  const configured = isGooglePhotosConfigured();
  return NextResponse.json({
    configured,
    connected: configured ? await isGooglePhotosConnected() : false,
    redirectUri: redirectUri(origin),
    origin,
  });
}
