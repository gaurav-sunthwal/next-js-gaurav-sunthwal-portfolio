import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { themeScript } from "@/components/site/ThemeToggle";
import "./globals.css";
import { ALTERNATE_NAMES, DESCRIPTION, JOB_TITLE, KEYWORDS, KNOWS_ABOUT, PERSON_NAME, SITE_URL } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${PERSON_NAME} — ${JOB_TITLE}`,
    template: `%s | ${PERSON_NAME}`,
  },
  description: DESCRIPTION,
  applicationName: PERSON_NAME,
  keywords: KEYWORDS,
  authors: [{ name: PERSON_NAME, url: SITE_URL }],
  creator: PERSON_NAME,
  publisher: PERSON_NAME,
  category: "technology",
  alternates: { canonical: "/" },
  openGraph: {
    title: `${PERSON_NAME} — ${JOB_TITLE}`,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: PERSON_NAME,
    locale: "en_US",
    type: "profile",
    firstName: "Gaurav",
    lastName: "Sunthwal",
    username: "gaurav-sunthwal",
  },
  twitter: {
    card: "summary_large_image",
    title: `${PERSON_NAME} — ${JOB_TITLE}`,
    description: DESCRIPTION,
    creator: "@GauravSunthwal1",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
  // Paste the codes from Google Search Console / Bing Webmaster Tools into these env vars.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f7f3" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0e" },
  ],
};

// Tells Google who this site is about, so it can build a knowledge panel for the name.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: PERSON_NAME,
      givenName: "Gaurav",
      familyName: "Sunthwal",
      alternateName: ALTERNATE_NAMES,
      url: SITE_URL,
      image: `${SITE_URL}/Img/gaurav.jpg`,
      email: "mailto:gauravsunthwalwork@gmail.com",
      jobTitle: JOB_TITLE,
      description: DESCRIPTION,
      hasOccupation: [
        { "@type": "Occupation", name: "Full Stack Developer", occupationLocation: { "@type": "Country", name: "India" } },
        { "@type": "Occupation", name: "AI Engineer", occupationLocation: { "@type": "Country", name: "India" } },
        { "@type": "Occupation", name: "Mobile App Developer", occupationLocation: { "@type": "Country", name: "India" } },
      ],
      address: { "@type": "PostalAddress", addressLocality: "Pune", addressRegion: "Maharashtra", addressCountry: "IN" },
      worksFor: { "@type": "Organization", name: "Terminal 2" },
      knowsAbout: KNOWS_ABOUT,
      alumniOf: { "@type": "EducationalOrganization", name: "MIT World Peace University (MIT-WPU)" },
      sameAs: [
        "https://github.com/gaurav-sunthwal",
        "https://linkedin.com/in/gaurav-sunthwal",
        "https://x.com/GauravSunthwal1",
        "https://www.youtube.com/@GauravSunthwalVlogs",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: PERSON_NAME,
      alternateName: ["Gaurav Sunthwal Portfolio", "gauravsunthwal"],
      description: DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#person` },
    },
    {
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: SITE_URL,
      name: `${PERSON_NAME} — ${JOB_TITLE}`,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      mainEntity: { "@id": `${SITE_URL}/#person` },
    },
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
