// Browser-only helpers for videos added in the admin panel.

export type VideoInfo = { width: number; height: number; duration: number; poster: Blob | null };

/**
 * Loads a video (a local file URL or one of our /media URLs), reads its size
 * and length, and grabs a frame about a second in to use as its cover image.
 */
export function readVideo(src: string): Promise<VideoInfo> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    let settled = false;
    const finish = (info: VideoInfo) => {
      if (settled) return;
      settled = true;
      video.removeAttribute("src");
      video.load();
      resolve(info);
    };
    const timer = setTimeout(
      () => finish({ width: video.videoWidth, height: video.videoHeight, duration: video.duration || 0, poster: null }),
      20000
    );

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(1, (video.duration || 2) / 4);
    };
    video.onseeked = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const duration = Math.round(video.duration || 0);
      try {
        const scale = Math.min(1, 1280 / Math.max(width, height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        canvas.getContext("2d")!.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (poster) => {
            clearTimeout(timer);
            finish({ width, height, duration, poster });
          },
          "image/jpeg",
          0.85
        );
      } catch {
        clearTimeout(timer);
        finish({ width, height, duration, poster: null });
      }
    };
    video.onerror = () => {
      clearTimeout(timer);
      finish({ width: 0, height: 0, duration: 0, poster: null });
    };
    video.src = src;
  });
}

export const isVideoFile = (file: File) => file.type.startsWith("video/");
export const isVideoUrl = (url: string) => /\.(mp4|webm|mov|m4v|ogv)($|\?)/i.test(url);

export function formatDuration(seconds: number) {
  if (!seconds) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}
