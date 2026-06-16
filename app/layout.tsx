import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gauravsunthwal.vercel.app"),
  title: "Gaurav Sunthwal — Full Stack & App Developer Portfolio",
  description: "Gaurav Sunthwal is a Professional software engineer. Specializing in high-performance Next.js web applications, React Native mobile apps, and Generative AI integrations.",
  keywords: [
    "Gaurav Sunthwal",
    "Full Stack Developer",
    "App Developer",
    "Software Engineer",
    "Next.js Portfolio",
    "React Native developer",
    "Generative AI integration",
    "PostgreSQL",
    "TypeScript Portfolio"
  ],
  authors: [{ name: "Gaurav Sunthwal" }],
  creator: "Gaurav Sunthwal",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gaurav Sunthwal — Full Stack & App Developer Portfolio",
    description: "Gaurav Sunthwal is a Professional software engineer. Specializing in high-performance Next.js web applications, React Native mobile apps, and Generative AI integrations.",
    url: "https://gauravsunthwal.vercel.app",
    siteName: "Gaurav Sunthwal Portfolio",
    locale: "en_US",
    type: "profile",
    firstName: "Gaurav",
    lastName: "Sunthwal",
    username: "gaurav-sunthwal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaurav Sunthwal — Full Stack & App Developer Portfolio",
    description: "Gaurav Sunthwal is a Professional software engineer. Specializing in high-performance Next.js web applications, React Native mobile apps, and Generative AI integrations."
  },
  verification: {
    google: "4S-SnEkKgabU7Yr4avzDYY7XrbS0BRFh9hpZA8P6uLk",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Gaurav Sunthwal",
    "url": "https://gauravsunthwal.vercel.app",
    "jobTitle": "Full Stack & App Developer",
    "description": "Gaurav Sunthwal is a Professional software engineer. Specializing in high-performance Next.js web applications, React Native mobile apps, and Generative AI integrations.",
    "knowsAbout": [
      "Next.js",
      "React Native",
      "TypeScript",
      "Generative AI",
      "PostgreSQL",
      "Drizzle ORM",
      "Tailwind CSS",
      "Redux",
      "Node.js"
    ],
    "alumniOf": {
      "@type": "EducationalOrganization",
      "name": "MIT World Peace University (MIT-WPU)"
    },
    "sameAs": [
      "https://github.com/gaurav-sunthwal",
      "https://linkedin.com/in/gaurav-sunthwal",
      "https://x.com/GauravSunthwal1",
      "https://www.youtube.com/@GauravSunthwalVlogs",
      "https://app.codecrafters.io/users/gaurav-sunthwal",
      "https://www.opentalent.in/gaurav-naresh-sunthwal"
    ]
  };

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
