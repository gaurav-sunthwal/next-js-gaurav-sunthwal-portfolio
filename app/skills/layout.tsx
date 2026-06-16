import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills & Technical Stack | Gaurav Sunthwal — Full Stack & App Developer",
  description: "Detailed breakdown of Gaurav Sunthwal's core engineering skills, programming languages, database systems, AI tools, and frameworks.",
  alternates: {
    canonical: "/skills",
  },
  openGraph: {
    title: "Skills & Technical Stack | Gaurav Sunthwal — Full Stack & App Developer",
    description: "Detailed breakdown of Gaurav Sunthwal's core engineering skills, programming languages, database systems, AI tools, and frameworks.",
    url: "https://gauravsunthwal.vercel.app/skills",
  },
};

export default function SkillsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
