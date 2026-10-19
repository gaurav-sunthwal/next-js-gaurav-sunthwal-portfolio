/**
 * Gets the video id from anything YouTube gives you:
 *   https://www.youtube.com/watch?v=ID
 *   https://youtu.be/ID
 *   https://www.youtube.com/embed/ID   (also the full <iframe ...> embed code)
 *   https://www.youtube.com/shorts/ID
 *   or just the 11-character id.
 */
export function youtubeId(input?: string | null): string | null {
  if (!input) return null;
  const text = input.trim();
  if (/^[\w-]{11}$/.test(text)) return text;

  const src = text.match(/src=["']([^"']+)["']/)?.[1] ?? text;
  const match =
    src.match(/youtu\.be\/([\w-]{11})/) ||
    src.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/([\w-]{11})/) ||
    src.match(/[?&]v=([\w-]{11})/);
  return match?.[1] ?? null;
}

export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const youtubeThumb = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
