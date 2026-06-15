import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import bcrypt from "bcryptjs";
import {
  projects,
  experiences,
  skills,
  education,
  certifications,
  testimonials,
  aiSpecialization,
  databases,
  users,
} from "./schema";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:YVE4fgOC7fiBjNBg@db.yzzsadplqfgisftryvkq.supabase.co:5432/postgres";

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

async function seed() {
  console.log("🌱 Seeding database...\n");

  // --- Projects ---
  console.log("📦 Seeding projects...");
  await db.delete(projects); // Clear first
  await db.insert(projects).values([
    {
      id: "coursecrafter-ai",
      title: "CourseCrafter AI",
      description:
        "An AI-powered course generator that transforms any topic into a comprehensive learning path. Orchestrated with Gemini API for dynamic content generation and shadcn/ui for a premium interface.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAycMyoaGZTzaYduOfavHwUJ2mlDQXzSlZwdnVfLJm7JDGvZ-pgaIhIPRuz4gcLMVMFVRIn1UU9A8SIERpj6ODWeqjgnOBXDnLLbblFzYahRA9mTQsnNal54wVFsQfOvforoPpmtSotLUpI0DG4YhTSCxDl-g-ZMNHkg9o2HstsQ9awETbLuVLL8iklIB8Kd0A7kD3qV63VcJdrT4CI019aJyUpo6LkGsRHakjv_mAi9kurzSc1ipVZVUkhpIZVtLcR_VXiCP2fLJ_b",
      tags: ["Next.js", "PostgreSQL", "Gemini AI"],
      type: "web",
      demoUrl: "https://nextjs.org",
      links: [
        { label: "View Project", href: "#", icon: "open_in_new" },
        { label: "Source Code", href: "#", icon: "code" },
      ],
    },
    {
      id: "ai-mock-interview",
      title: "AI Mock Interview",
      description:
        "Realistic interview simulator designed to help developers ace technical screenings. Uses Gemini AI to analyze responses in real-time, providing constructive feedback and scoring.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBSs9sKCfTlghSGM0YDmP5GaEWXdxhxPZ3V5QMH6KTN0uzgH-LcgCwRh5IR-HbaoDzMEkTAsp0oU9cMPQXvYgDFCWAtXwZgl-1xG7HhfEKHJ8oYw_lbMFj1O3j3DaGd7wiY2t7PL3uisya07Y_DNvxi1V6Oh1a3X-Tp0TP0QHcY2f7PRx_OOw16fHaEAXp6uzYgjYT7CHhMsTK9G10S_pmC8Nm1QAA9AJHVxeJznWHEEmkMa5NPhpG1gqYGC0N59L8McAm_jFk-kPLP",
      tags: ["React", "Drizzle ORM", "GenAI"],
      type: "web",
      demoUrl: "https://react.dev",
      links: [
        { label: "Live Demo", href: "#", icon: "play_circle" },
        { label: "Source Code", href: "#", icon: "code" },
      ],
    },
    {
      id: "terminal-2-mobile",
      title: "Terminal 2 Mobile App",
      description:
        "High-performance iOS and Android mobile app designed to orchestrate workflows, featuring real-time telemetry metrics, clean grid layouts, and cross-platform offline sync capability.",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCW3IaaO2YHwxt3FfpK1loWUisMrTup3jT8g0HLgdfH9b9-bjWb8QE_si_EBqKX9t7dnoksvy9XhMRy4KFeHrCUO6COwaziKVUMk8erIRrW2waPkyeoJmi_xzYZJ_Of2_miwyNafkRXr5_5SSApiONdfDWQpjaZbbuqBqd_wGqJIyQEadBxSZRvQx4D6TEvMBZGVi29QLg1bmcp9n3L3gf04ahLUCaQt977SdK8Ga_05JL0AK08JDsw80MLYU_3vjElVsPQrfa5Syfg",
      tags: ["React Native", "Expo", "Redux Toolkit"],
      type: "app",
      screenshots: [
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBSs9sKCfTlghSGM0YDmP5GaEWXdxhxPZ3V5QMH6KTN0uzgH-LcgCwRh5IR-HbaoDzMEkTAsp0oU9cMPQXvYgDFCWAtXwZgl-1xG7HhfEKHJ8oYw_lbMFj1O3j3DaGd7wiY2t7PL3uisya07Y_DNvxi1V6Oh1a3X-Tp0TP0QHcY2f7PRx_OOw16fHaEAXp6uzYgjYT7CHhMsTK9G10S_pmC8Nm1QAA9AJHVxeJznWHEEmkMa5NPhpG1gqYGC0N59L8McAm_jFk-kPLP",
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAeoObszp_TOcenfun5u-QJ7qqmQWVQUgeqQjXlaDJNgKs902U-reqt3l3YBe3zI5dbzBtua-wHdiXZ5Udhe8dLzGAzmZyIGqgVpYpuiBGughMCbXco4quVl1hAoBRDbZ_ovyVHpM6H8FWqmHJz_mKGJZ6pz0iea03JseC0Jf17IWxSH1_XYdLOzfQUGovWGHPRAH0uB20HPzdLuVhElv4D0Y5190Ku7FinHmhRU5pPlVO_S_S_YDj7VsIzwbBBtE-tAUyESyh-YFbR",
      ],
      links: [{ label: "View Showcase", href: "#", icon: "open_in_new" }],
    },
  ]);
  console.log("  ✅ 3 projects inserted");

  // --- Experience ---
  console.log("💼 Seeding experience...");
  await db.delete(experiences);
  await db.insert(experiences).values([
    {
      company: "Terminal 2",
      role: "Full Stack Developer / App Developer",
      period: "Sep 2025 – Present",
      badge: "Current",
      badgeType: "primary",
      bullets: [
        "Engineered scalable web and mobile ecosystems using Next.js and React Native.",
        "Architected complex state management and responsive UI components for cross-platform performance.",
      ],
      tech: ["Next.js", "React Native", "TypeScript", "Redux"],
    },
    {
      company: "Arealis",
      role: "Full Stack Developer Intern",
      period: "Jun 2025 – Aug 2025",
      badge: "Internship",
      badgeType: "secondary",
      bullets: [
        "Contributed to end-to-end development of scalable web applications.",
        "Integrated complex backend logic with modern frontend frameworks to optimize user workflows.",
      ],
      tech: ["React", "Node.js", "MongoDB", "REST API"],
    },
    {
      company: "Brisky WebSolutions",
      role: "Full Stack Developer",
      period: "Project Lead",
      badge: "Project Lead",
      badgeType: "secondary",
      bullets: [
        "Built a high-performance full-stack website from ground zero.",
        "Leveraged PostgreSQL for robust data integrity and Tailwind CSS for rapid, bespoke UI development.",
      ],
      tech: ["Next.js", "Tailwind CSS", "PostgreSQL", "Prisma"],
    },
  ]);
  console.log("  ✅ 3 experiences inserted");

  // --- Skills ---
  console.log("🛠️ Seeding skills...");
  await db.delete(skills);
  await db.insert(skills).values([
    { name: "Python", subtitle: "Automation & AI" },
    { name: "JavaScript", subtitle: "ES6+ Standard" },
    { name: "TypeScript", subtitle: "Type-safe Architecture" },
    { name: "React.js", subtitle: "Component Design" },
    { name: "Next.js", subtitle: "Fullstack Framework" },
    { name: "Node.js", subtitle: "Runtime Environment" },
  ]);
  console.log("  ✅ 6 skills inserted");

  // --- AI Specialization ---
  console.log("🤖 Seeding AI specialization...");
  await db.delete(aiSpecialization);
  await db.insert(aiSpecialization).values([
    { name: "Gemini" },
    { name: "GPT" },
    { name: "Claude" },
    { name: "Llama" },
    { name: "LangChain" },
    { name: "LangGraph" },
  ]);
  console.log("  ✅ 6 AI specs inserted");

  // --- Databases ---
  console.log("🗄️ Seeding databases...");
  await db.delete(databases);
  await db.insert(databases).values([
    { name: "Firebase" },
    { name: "Drizzle" },
    { name: "PostgreSQL" },
    { name: "MongoDB" },
  ]);
  console.log("  ✅ 4 databases inserted");

  // --- Education ---
  console.log("🎓 Seeding education...");
  await db.delete(education);
  await db.insert(education).values([
    {
      degree: "Bachelor of Technology",
      school: "MIT World Peace University",
      location: "Pune, India",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSa3FPSp4E5hhf8AgIZoEhRNuqz7qS1lAWqOg&s",
    },
  ]);
  console.log("  ✅ 1 education inserted");

  // --- Certifications ---
  console.log("📜 Seeding certifications...");
  await db.delete(certifications);
  await db.insert(certifications).values([
    {
      title: "The Complete JavaScript Course",
      subtitle: "Advanced Logic & Patterns",
    },
    {
      title: "Build Responsive Websites",
      subtitle: "UX/UI & Layout Strategy",
    },
  ]);
  console.log("  ✅ 2 certifications inserted");

  // --- Testimonials ---
  console.log("💬 Seeding testimonials...");
  await db.delete(testimonials);
  await db.insert(testimonials).values([
    {
      role: "CTO",
      company: "Terminal 2",
      avatar: "T",
      quote:
        "Gaurav's ability to translate complex AI requirements into scalable web applications is exceptional. He delivered our RAG system ahead of schedule.",
    },
    {
      role: "Product Manager",
      company: "Arealis",
      avatar: "A",
      quote:
        "A rare talent who understands both the 'why' and the 'how'. His work on CourseCrafter AI set a new standard for our product's UX.",
    },
    {
      role: "Founder",
      company: "WebSolutions",
      avatar: "W",
      quote:
        "Professional, communicative, and technically brilliant. Gaurav is my go-to for any high-stakes React or AI integration projects.",
    },
    {
      role: "Engineering Director",
      company: "DataSync",
      avatar: "D",
      quote:
        "Gaurav's capability in React and AI logic integrations is state of the art. He resolved our complex data flows effortlessly.",
    },
  ]);
  console.log("  ✅ 4 testimonials inserted");

  // --- Admin User ---
  console.log("👤 Seeding default admin user...");
  await db.delete(users);
  const adminPasswordHash = await bcrypt.hash("admin", 10);
  await db.insert(users).values({
    username: "admin",
    passwordHash: adminPasswordHash,
  });
  console.log("  ✅ Default admin user (username: 'admin', password: 'admin') seeded");
 
  console.log("\n🎉 Seed complete! All data pushed to database.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
