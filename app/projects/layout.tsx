import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects | Gaurav Sunthwal — Full Stack & App Developer",
  description: "Explore the technical projects and case studies built by Gaurav Sunthwal, featuring full-stack development, Next.js, React Native, and Generative AI/RAG integrations.",
  alternates: {
    canonical: "/projects",
  },
  openGraph: {
    title: "Projects | Gaurav Sunthwal — Full Stack & App Developer",
    description: "Explore the technical projects and case studies built by Gaurav Sunthwal, featuring full-stack development, Next.js, React Native, and Generative AI/RAG integrations.",
    url: "https://gauravsunthwal.vercel.app/projects",
  },
};

export default function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
