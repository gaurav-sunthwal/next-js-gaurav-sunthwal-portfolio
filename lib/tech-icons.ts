// Maps a technology name to a Simple Icons slug (https://simpleicons.org).
// Only names we know have an icon get one, so we never render broken images.

const ALIASES: Record<string, string> = {
  "react.js": "react",
  reactjs: "react",
  "react 19": "react",
  "react native": "react",
  "next.js": "nextdotjs",
  nextjs: "nextdotjs",
  "next.js 16": "nextdotjs",
  "node.js": "nodedotjs",
  nodejs: "nodedotjs",
  node: "nodedotjs",
  "express.js": "express",
  "tailwind css": "tailwindcss",
  "tailwind css 4": "tailwindcss",
  tailwind: "tailwindcss",
  "shadcn/ui": "shadcnui",
  shadcn: "shadcnui",
  postgres: "postgresql",
  "neon postgresql": "neon",
  neon: "neon",
  "drizzle orm": "drizzle",
  drizzle: "drizzle",
  "vue.js": "vuedotjs",
  
  "three.js": "threedotjs",
  "socket.io": "socketdotio",
  "github actions": "githubactions",
  "google cloud": "googlecloud",
  gcp: "googlecloud",
  "gemini ai": "googlegemini",
  "google gemini ai": "googlegemini",
  gemini: "googlegemini",
  "openai api": "",
  gpt: "",
  claude: "anthropic",
  "claude code": "anthropic",
  llama: "meta",
  "aws s3": "",
  "aws dynamodb": "",
  dynamodb: "",
  "framer motion": "framer",
  "expo router": "expo",
  "eas build/submit": "expo",
  "firebase auth": "firebase",
  "chrome extension": "googlechrome",
  "firefox extension": "firefoxbrowser",
  "rest api": "",
  "rest apis": "",
  "c++": "cplusplus",
  "c#": "",
  "hugging face": "huggingface",
  "scikit-learn": "scikitlearn",
  "redux toolkit": "redux",
  "tesseract.js": "",
  "google apis": "google",
  "manifest v3": "googlechrome",
};

const KNOWN = new Set([
  "typescript", "javascript", "python", "react", "nextdotjs", "nodedotjs", "express", "tailwindcss",
  "postgresql", "mongodb", "mysql", "sqlite", "redis", "firebase", "supabase", "prisma", "drizzle",
  "docker", "kubernetes", "nginx", "cloudflare", "vercel", "netlify", "githubactions", "github", "git",
  "ubuntu", "linux", "googlecloud", "googlegemini",
  "anthropic", "langchain", "huggingface", "pytorch", "tensorflow", "opencv", "fastapi",
  "django", "flask", "graphql", "apollographql", "socketdotio", "redux", "reactquery",
  "vuedotjs", "svelte", "angular", "threedotjs", "framer", "expo", "electron", "android",
  "ios", "swift", "kotlin", "flutter", "dart", "go", "rust", "cplusplus", "php", "laravel",
  "figma", "sentry", "stripe", "razorpay", "revenuecat", "i18next", "shadcnui", "radixui", "vite",
  "webpack", "bun", "deno", "jest", "vitest", "cypress", "postman", "neon",
  "elasticsearch", "apachekafka", "rabbitmq", "sequelize", "mongoose", "jsonwebtokens", "resend",
  "meta", "googlechrome", "firefoxbrowser", "google", "whatsapp", "html5", "css", "sass", "npm",
  "pnpm", "yarn", "numpy", "pandas", "jupyter", "scikitlearn", "clerk", "auth0", "trpc", "zod",
  "chartdotjs", "d3", "markdown", "notion", "discord", "telegram", "ollama",
]);

// Logos that are pure black and need inverting on dark backgrounds.
const DARK_LOGOS = new Set([
  "nextdotjs", "express", "vercel", "github", "anthropic", "shadcnui", "radixui", "prisma",
  "drizzle", "apachekafka", "threedotjs", "framer", "expo", "notion", "resend", "ollama", "socketdotio",
  "jsonwebtokens", "markdown", "clerk", "electron", "bun", "deno", "rust",
]);

export function techSlug(name: string): string | null {
  const key = name.trim().toLowerCase();
  if (key in ALIASES) return ALIASES[key] || null;
  const guess = key.replace(/\.js$/, "dotjs").replace(/\./g, "dot").replace(/[\s/_-]+/g, "");
  return KNOWN.has(guess) ? guess : null;
}

/** Resolves an icon for a tech name. `override` may be a full URL or a slug. */
export function techIcon(name: string, override?: string | null) {
  if (override) {
    if (/^(https?:)?\/\//.test(override) || override.startsWith("/")) return { src: override, invert: false };
    return { src: `https://cdn.simpleicons.org/${override}`, invert: DARK_LOGOS.has(override) };
  }
  const slug = techSlug(name);
  if (!slug) return null;
  return { src: `https://cdn.simpleicons.org/${slug}`, invert: DARK_LOGOS.has(slug) };
}
