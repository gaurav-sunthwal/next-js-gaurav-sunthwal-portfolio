import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/schema";

/*
 * Google Photos Picker API (https://developers.google.com/photos/picker).
 * The admin signs in with Google once; we keep a refresh token in the
 * settings table (never sent to the public site) and use it to open Google's
 * own photo picker and download the photos picked there.
 *
 * Needs: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET (an OAuth "Web application"
 * client with redirect URI <your site>/api/google-photos/callback).
 */

export const PICKER_SCOPE = "https://www.googleapis.com/auth/photospicker.mediaitems.readonly";
const TOKEN_KEY = "google_photos_refresh_token";
const API = "https://photospicker.googleapis.com/v1";

export function isGooglePhotosConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function redirectUri(origin: string) {
  return `${origin}/api/google-photos/callback`;
}

export function authUrl(origin: string, state: string) {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: PICKER_SCOPE,
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

async function saveRefreshToken(token: string | null) {
  if (!token) {
    await db.delete(settings).where(eq(settings.key, TOKEN_KEY));
    return;
  }
  await db.insert(settings).values({ key: TOKEN_KEY, value: token }).onConflictDoUpdate({ target: settings.key, set: { value: token } });
}

async function loadRefreshToken() {
  const [row] = await db.select().from(settings).where(eq(settings.key, TOKEN_KEY));
  return row?.value || null;
}

export async function isGooglePhotosConnected() {
  return Boolean(await loadRefreshToken());
}

export async function disconnect() {
  const token = await loadRefreshToken();
  if (token) {
    await fetch(`https://oauth2.googleapis.com/revoke?token=${encodeURIComponent(token)}`, { method: "POST" }).catch(() => {});
  }
  cached = null;
  await saveRefreshToken(null);
}

/** Exchanges the code from Google's sign-in redirect and stores the refresh token. */
export async function finishSignIn(code: string, origin: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error_description || data.error || "Google sign-in failed");
  if (!data.refresh_token) throw new Error("Google didn't return a refresh token. Remove the app's access in your Google Account and connect again.");
  await saveRefreshToken(data.refresh_token);
  cached = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
}

let cached: { token: string; expires: number } | null = null;

async function accessToken() {
  if (cached && cached.expires > Date.now()) return cached.token;
  const refresh = await loadRefreshToken();
  if (!refresh) throw new Error("Google Photos isn't connected yet.");
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.error === "invalid_grant") await saveRefreshToken(null); // access was revoked
    throw new Error("Google Photos access expired. Please connect again.");
  }
  cached = { token: data.access_token, expires: Date.now() + (data.expires_in - 60) * 1000 };
  return cached.token;
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json", ...(init.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Google Photos error (${res.status})`);
  return data as T;
}

export type PickerSession = {
  id: string;
  pickerUri: string;
  mediaItemsSet?: boolean;
  pollingConfig?: { pollInterval?: string; timeoutIn?: string };
  expireTime?: string;
};

export type PickedMediaItem = {
  id: string;
  createTime?: string;
  type?: "PHOTO" | "VIDEO" | "TYPE_UNSPECIFIED";
  mediaFile: {
    baseUrl: string;
    mimeType?: string;
    filename?: string;
    mediaFileMetadata?: {
      width?: number;
      height?: number;
      videoMetadata?: { fps?: number; processingStatus?: "UNSPECIFIED" | "PROCESSING" | "READY" | "FAILED" };
    };
  };
};

export type PickedSummary = {
  id: string;
  kind: "photo" | "video";
  filename: string;
  mimeType: string;
  baseUrl: string;
  width: number;
  height: number;
  createTime: string | null;
  ready: boolean; // videos must finish processing in Google Photos first
  alreadyAdded: boolean;
};

export const createSession = () => call<PickerSession>("/sessions", { method: "POST", body: "{}" });
export const getPickerSession = (id: string) => call<PickerSession>(`/sessions/${encodeURIComponent(id)}`);
export const deleteSession = (id: string) => call(`/sessions/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => {});

export function listPicked(sessionId: string, pageToken?: string, pageSize = 10) {
  const params = new URLSearchParams({ sessionId, pageSize: String(pageSize) });
  if (pageToken) params.set("pageToken", pageToken);
  return call<{ mediaItems?: PickedMediaItem[]; nextPageToken?: string }>(`/mediaItems?${params}`);
}

/** Only ever send our Google token to Google's own media servers. */
export function assertGoogleMediaUrl(url: string) {
  const host = new URL(url).hostname;
  if (!host.endsWith(".googleusercontent.com")) throw new Error("Not a Google Photos media link.");
}

/** Opens a stream of a picked video (Google's high-quality transcode, "=dv"). */
export async function openVideoStream(baseUrl: string) {
  assertGoogleMediaUrl(baseUrl);
  const res = await fetch(`${baseUrl}=dv`, { headers: { Authorization: `Bearer ${await accessToken()}` } });
  if (!res.ok || !res.body) throw new Error(`Couldn't download the video (${res.status})`);
  return { body: res.body, type: (res.headers.get("content-type") || "video/mp4").split(";")[0] };
}

/** A still frame for a video, without the play-button overlay ("-no"). */
export async function downloadVideoThumbnail(baseUrl: string, max = 1280) {
  assertGoogleMediaUrl(baseUrl);
  const res = await fetch(`${baseUrl}=w${max}-h${max}-no`, { headers: { Authorization: `Bearer ${await accessToken()}` } });
  if (!res.ok) throw new Error(`Couldn't download the video cover (${res.status})`);
  return { bytes: new Uint8Array(await res.arrayBuffer()), type: (res.headers.get("content-type") || "image/jpeg").split(";")[0] };
}

/** Downloads a picked photo, scaled to fit within `max` px (Google does the resizing). */
export async function downloadPhoto(item: PickedMediaItem, max = 2560) {
  assertGoogleMediaUrl(item.mediaFile.baseUrl);
  const res = await fetch(`${item.mediaFile.baseUrl}=w${max}-h${max}`, {
    headers: { Authorization: `Bearer ${await accessToken()}` },
  });
  if (!res.ok) throw new Error(`Couldn't download ${item.mediaFile.filename || item.id} (${res.status})`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  const type = (res.headers.get("content-type") || item.mediaFile.mimeType || "image/jpeg").split(";")[0];

  // Work out the size of the downloaded (scaled) image from the original's size.
  const w = item.mediaFile.mediaFileMetadata?.width || 0;
  const h = item.mediaFile.mediaFileMetadata?.height || 0;
  const scale = w && h ? Math.min(1, max / Math.max(w, h)) : 1;
  return { bytes, type, width: Math.round(w * scale), height: Math.round(h * scale) };
}
