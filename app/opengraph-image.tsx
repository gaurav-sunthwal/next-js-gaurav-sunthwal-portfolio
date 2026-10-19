import { ImageResponse } from "next/og";
import { JOB_TITLE, PERSON_NAME, SITE_URL } from "@/lib/seo";

// The preview card shown when the site is shared on LinkedIn, X, WhatsApp, Slack, etc.
export const alt = `${PERSON_NAME} — ${JOB_TITLE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const photo = `${SITE_URL}/Img/gaurav.jpg`;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", gap: 64, padding: 80, background: "#100f0e", color: "#f8f7f3" }}>
        <img src={photo} width={280} height={280} alt="" style={{ borderRadius: 40, objectFit: "cover", border: "6px solid #2a2826" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -2 }}>{PERSON_NAME}</div>
          <div style={{ fontSize: 38, color: "#b8b4ad" }}>Full Stack Developer · AI Engineer</div>
          <div style={{ fontSize: 28, color: "#8a857d" }}>Next.js · React Native · Generative AI · Pune, India</div>
          <div style={{ fontSize: 26, color: "#f8f7f3", marginTop: 16 }}>{SITE_URL.replace(/^https?:\/\//, "")}</div>
        </div>
      </div>
    ),
    size
  );
}
