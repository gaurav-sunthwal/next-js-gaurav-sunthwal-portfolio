// Profile / site settings stored in the `settings` key-value table.
// Every key here is editable from Admin → Profile. Defaults are used
// whenever a key has not been saved yet.

export const SITE_SETTING_DEFAULTS = {
  name: "Gaurav Sunthwal",
  tagline: "Full Stack & AI Engineer",
  bio: "__Full-stack__ engineer with a strong __product__ and ~~design~~ sense. I ship __LLM__-powered web and mobile apps end to end with Next.js, FastAPI and React Native, used by **2,000+** people. Currently shipping [ScrollShop](/projects/scrollshop) @ **Terminal 2**, and the builder of [Rolesetu](/projects/rolesetu).",
  avatar_urls: "/Img/gaurav.jpg",
  current_role: "Full Stack / Mobile App Developer",
  current_company: "Terminal 2",
  current_company_logo: "",
  current_company_url: "",
  location: "Pune, India",
  email: "gauravsunthwalwork@gmail.com",
  highlights: "Shipped apps used by 2,000+ users\nBuilt Rolesetu, live on the Chrome Web Store | /projects/rolesetu",
  github_username: "gaurav-sunthwal",
  social_github: "https://github.com/gaurav-sunthwal",
  social_linkedin: "https://linkedin.com/in/gaurav-sunthwal",
  social_x: "https://x.com/GauravSunthwal1",
  social_youtube: "https://www.youtube.com/@GauravSunthwalVlogs",
  booking_url: "",
  contact_title: "Building something cool?",
  contact_description:
    "I'm always up for a good idea. Tell me what you're working on and let's build something great together.",
  contact_backdrop: "/backdrops/contact.jpg",
  footer_note: "If you made it this far, say hi. I reply to every message.",
  about_long: "",
  show_verified: "true",
  gallery_title: "Touching grass",
  gallery_subtitle: "Proof that I do more than just stare at my screen.",
  gallery:
    "/gallery/g1.jpg | camping in the snow\n/gallery/g2.jpg | valley walks\n/gallery/g3.jpg | still water\n/gallery/g4.jpg | beach evenings\n/gallery/g5.jpg | above the clouds\n/gallery/g6.jpg | lake days",
  resume_url: "",
};

export type SiteSettingKey = keyof typeof SITE_SETTING_DEFAULTS;
export type SiteSettings = Record<SiteSettingKey, string>;

// Keys that must never be sent to the public site.
export const SECRET_SETTING_KEYS = ["gemini_api_key"];

export function isSecretSetting(key: string) {
  return SECRET_SETTING_KEYS.includes(key) || /(_key|_token|_secret)$/.test(key);
}

export function mergeSettings(saved: Record<string, string>): SiteSettings {
  const merged = { ...SITE_SETTING_DEFAULTS } as SiteSettings;
  for (const key of Object.keys(SITE_SETTING_DEFAULTS) as SiteSettingKey[]) {
    // Anything saved in the admin wins, even an empty value (that's how you
    // remove all photos or hide a link). Defaults only fill keys never saved.
    const value = saved[key];
    if (typeof value === "string") merged[key] = value;
  }
  return merged;
}

export function splitLines(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** "Top 10% on LeetCode | https://leetcode.com/u/me | https://icon.png" */
export function parseHighlights(value: string) {
  return splitLines(value).map((line) => {
    const [text, href, icon] = line.split("|").map((part) => part.trim());
    return { text, href: href || "", icon: icon || "" };
  });
}
