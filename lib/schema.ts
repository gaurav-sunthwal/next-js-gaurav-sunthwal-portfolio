import { pgTable, text, serial, jsonb, timestamp, integer } from "drizzle-orm/pg-core";

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
  position: integer("position").default(0).notNull(),
});

export const skills = pgTable("skills", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subtitle: text("subtitle").notNull(),
});

export const education = pgTable("education", {
  id: serial("id").primaryKey(),
  degree: text("degree").notNull(),
  school: text("school").notNull(),
  location: text("location").notNull(),
  image: text("image").notNull(),
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

