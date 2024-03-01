//@ts-nocheck

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import favicon from "../assets/Img/me.jpg";
import HomeFooter from "./Components/HomeFooter";
import Navbar from "./Components/Navbar";
import { Analytics } from "@vercel/analytics/react"
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gaurav Sunthwal",
  description:
    "Hello, I'm Gaurav Sunthwal, a software engineer and web developer completing my BTech at MIT WPU, Pune. Proficient in Next.js, React.js, JavaScript, Python, HTML, CSS, Chakra UI/Tailwind CSS, Node.js, MongoDB, and more, I specialize in crafting dynamic and user-friendly web applications. With a passion for innovation and a commitment to delivering high-quality solutions, I thrive on the challenges of modern web development. Outside of coding, I'm active in the developer community and dedicated to leveraging technology for positive change.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <link
          rel="icon"
          href={favicon}
          type="image/<generated>"
          sizes="<generated>"
        /> */}
        <meta
          name="google-site-verification"
          content="brnrAvH6YNLyRPlnUkA-3zemJp4es-Q9WvGhuEnt-no"
        />
      </head>
      <body
        style={{
          background: "black",
          color: "white",
        }}
        className={inter.className}
      >
        {" "}
        <Providers>
          <Navbar />
          {children}
          <Analytics/>
          <HomeFooter />
        </Providers>
      </body>
    </html>
  );
}
