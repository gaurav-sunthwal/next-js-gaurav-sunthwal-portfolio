import { NextResponse, type NextRequest } from "next/server";
import { finishSignIn } from "@/lib/google-photos";

// Admin-only (proxy.ts). Google redirects here after sign-in.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const origin = url.origin;
  const back = (status: string, message?: string) => {
    const res = NextResponse.redirect(
      `${origin}/admin?tab=memories&google=${status}${message ? `&message=${encodeURIComponent(message)}` : ""}`
    );
    res.cookies.delete("gp_oauth_state");
    return res;
  };

  const error = url.searchParams.get("error");
  if (error) return back("error", error === "access_denied" ? "You cancelled the Google sign-in." : error);

  const state = url.searchParams.get("state");
  if (!state || state !== request.cookies.get("gp_oauth_state")?.value) {
    return back("error", "Sign-in expired. Please try connecting again.");
  }

  try {
    await finishSignIn(url.searchParams.get("code") || "", origin);
    return back("connected");
  } catch (err: any) {
    return back("error", err.message);
  }
}
