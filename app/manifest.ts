import type { MetadataRoute } from "next";
import { DESCRIPTION, PERSON_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PERSON_NAME} — Portfolio`,
    short_name: PERSON_NAME,
    description: DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f8f7f3",
    theme_color: "#100f0e",
    icons: [{ src: "/icon.png", sizes: "any", type: "image/png" }],
  };
}
