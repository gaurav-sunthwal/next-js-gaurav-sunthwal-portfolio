import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work Experience | Gaurav Sunthwal — Full Stack & App Developer",
  description: "Work history and professional experience of Gaurav Sunthwal as a Full Stack & App Developer, building solutions at startups and enterprise projects.",
  alternates: {
    canonical: "/experience",
  },
  openGraph: {
    title: "Work Experience | Gaurav Sunthwal — Full Stack & App Developer",
    description: "Work history and professional experience of Gaurav Sunthwal as a Full Stack & App Developer, building solutions at startups and enterprise projects.",
    url: "https://gauravsunthwal.vercel.app/experience",
  },
};

export default function ExperienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
