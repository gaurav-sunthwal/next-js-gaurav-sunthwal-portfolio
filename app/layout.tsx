import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { themeScript } from "@/components/site/ThemeToggle";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

const SITE_URL = "https://gauravsunthwal.vercel.app";
const DESCRIPTION =
  "Gaurav Sunthwal is a full-stack and app developer building fast Next.js web apps, React Native mobile apps, and Generative AI integrations.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Gaurav Sunthwal — Full Stack & App Developer",
    template: "%s | Gaurav Sunthwal",
  },
  description: DESCRIPTION,
  keywords: [
    "Gaurav Sunthwal",
    "Full Stack Developer",
    "App Developer",
    "Software Engineer",
    "Next.js",
    "React Native",
    "Generative AI",
    "TypeScript",
  ],
  authors: [{ name: "Gaurav Sunthwal" }],
  creator: "Gaurav Sunthwal",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gaurav Sunthwal — Full Stack & App Developer",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Gaurav Sunthwal",
    locale: "en_US",
    type: "profile",
    firstName: "Gaurav",
    lastName: "Sunthwal",
    username: "gaurav-sunthwal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaurav Sunthwal — Full Stack & App Developer",
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0e" },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gaurav Sunthwal",
  url: SITE_URL,
  jobTitle: "Full Stack & App Developer",
  description: DESCRIPTION,
  knowsAbout: ["Next.js", "React Native", "TypeScript", "Generative AI", "PostgreSQL", "Drizzle ORM", "Tailwind CSS", "Node.js"],
  alumniOf: { "@type": "EducationalOrganization", name: "MIT World Peace University (MIT-WPU)" },
  sameAs: [
    "https://github.com/gaurav-sunthwal",
    "https://linkedin.com/in/gaurav-sunthwal",
    "https://x.com/GauravSunthwal1",
    "https://www.youtube.com/@GauravSunthwalVlogs",
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} scroll-smooth antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-screen bg-canvas font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
