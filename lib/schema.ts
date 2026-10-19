import { pgTable, text, serial, jsonb, timestamp, integer, boolean } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  image: text("image").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull(),
  type: text("type").$type<"web" | "app" | string>().notNull(),
  demoUrl: text("demo_url"),
  screenshots: jsonb("screenshots").$type<string[]>(),
  links: jsonb("links").$type<{ label: string; href: string; icon: string }[]>().notNull(),
  featured: boolean("featured").default(false).notNull(),
  content: text("content"),
  youtubeUrl: text("youtube_url"),
  position: integer("position").default(0).notNull(),
});

export const experiences = pgTable("experiences", {
  id: serial("id").primaryKey(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  period: text("period").notNull(),
  badge: text("badge").notNull(),
  badgeType: text("badge_type").$type<"primary" | "secondary" | string>().notNull(),
  bullets: jsonb("bullets").$type<string[]>().notNull(),
  tech: jsonb("tech").$type<string[]>().notNull(),
  logo: text("logo"),
  url: text("url"),
  position: integer("position").default(0).notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull(),
  icon: text("icon"),
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  degree: text("degree").notNull(),
  school: text("school").notNull(),
  location: text("location").notNull(),
  image: text("image").notNull(),
  period: text("period"),
  url: text("url"),
});

export const certifications = pgTable("certifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
});

export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  role: text("role").notNull(),
  company: text("company").notNull(),
  avatar: text("avatar").notNull(),
  quote: text("quote").notNull(),
  position: integer("position").default(0).notNull(),
});

export const aiSpecialization = pgTable("ai_specialization", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const databases = pgTable("databases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

// Photos for the Pinterest-style /memories page.
export const memories = pgTable("memories", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  caption: text("caption").default("").notNull(),
  takenOn: text("taken_on").default("").notNull(), // free text, e.g. "Dec 2025" or "Manali"
  width: integer("width").default(0).notNull(),
  height: integer("height").default(0).notNull(),
  position: integer("position").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"), // set = in "Recently deleted"
  source: text("source").default("upload").notNull(), // upload | link | google-photos
  sourceId: text("source_id"), // e.g. Google Photos media item id (avoids duplicates)
  kind: text("kind").default("photo").notNull(), // photo | video
  poster: text("poster"), // cover image for videos
  duration: integer("duration").default(0).notNull(), // video length in seconds
});

export const uploadedFiles = pgTable("uploaded_files", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  size: integer("size").default(0).notNull(),
  category: text("category").$type<"website" | "chat" | string>().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

