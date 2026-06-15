import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
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
  title: "Gaurav Sunthwal — Full Stack & App Developer Portfolio",
  description: "Professional software engineering portfolio of Gaurav Sunthwal. Specializing in high-performance Next.js web applications, React Native mobile apps, and Generative AI integrations.",
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
  openGraph: {
    title: "Gaurav Sunthwal — Full Stack & App Developer Portfolio",
    description: "Professional software engineering portfolio of Gaurav Sunthwal. Specializing in Next.js web applications, React Native mobile apps, and Generative AI integrations.",
    url: "https://gaurav-sunthwal.vercel.app",
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
    description: "Specializing in high-performance Next.js web applications, React Native mobile apps, and Generative AI integrations."
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
    "url": "https://gaurav-sunthwal.dev",
    "jobTitle": "Full Stack & App Developer",
    "description": "Professional software engineer specializing in high-performance Next.js web applications, React Native mobile apps, and Generative AI integrations.",
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
    "sameAs": [
      "https://github.com/gaurav-sunthwal",
      "https://linkedin.com/in/gaurav-sunthwal"
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
      </body>
    </html>
  );
}
