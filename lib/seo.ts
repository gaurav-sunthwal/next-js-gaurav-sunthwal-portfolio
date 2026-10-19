// Shared SEO facts used by metadata, structured data, sitemap, robots and llms.txt.
// If you move to a custom domain, set NEXT_PUBLIC_SITE_URL and everything follows.

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://gauravsunthwal.vercel.app").replace(/\/$/, "");

export const PERSON_NAME = "Gaurav Sunthwal";

// Other ways people search for the same person.
export const ALTERNATE_NAMES = ["Gaurav", "Gaurav S", "Sunthwal", "gaurav-sunthwal", "GauravSunthwal"];

export const JOB_TITLE = "Full Stack Developer & AI Engineer";

export const DESCRIPTION =
  "Gaurav Sunthwal is a full stack developer and AI engineer from Pune, India, building Next.js web apps, React Native mobile apps and Generative AI / LLM products. Available for full stack, app and AI development work.";

export const KEYWORDS = [
  "Gaurav Sunthwal",
  "Gaurav",
  "Sunthwal",
  "Gaurav Sunthwal portfolio",
  "Gaurav Sunthwal developer",
  "Full Stack Developer",
  "Full Stack Developer India",
  "Full Stack Developer Pune",
  "AI Developer",
  "AI Engineer",
  "Generative AI Developer",
  "LLM Developer",
  "App Developer",
  "React Native Developer",
  "Next.js Developer",
  "Software Engineer",
  "Hire Full Stack Developer",
  "Freelance Developer",
  "TypeScript",
  "FastAPI",
];

export const KNOWS_ABOUT = [
  "Full Stack Development",
  "Artificial Intelligence",
  "Generative AI",
  "Large Language Models",
  "Next.js",
  "React",
  "React Native",
  "TypeScript",
  "Node.js",
  "FastAPI",
  "Python",
  "PostgreSQL",
  "Drizzle ORM",
  "Tailwind CSS",
];

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);
