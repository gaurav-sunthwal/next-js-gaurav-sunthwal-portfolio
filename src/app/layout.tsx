//@ts-nocheck
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import favicon from "../assets/Img/me.jpg";
import HomeFooter from "./Components/HomeFooter";
import Navbar from "./Components/Navbar";
import { Analytics } from "@vercel/analytics/react";
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gaurav Sunthwal",
  description: `    
    Welcome to Gaurav Sunthwal's freelance digital design services! As a passionate Computer Science student at MIT-WPU, I specialize in creating captivating digital experiences that users love. With expertise in web development technologies such as ReactJS, HTML, CSS, Node.js, and more, I offer comprehensive solutions for your freelance projects.
    Whether you need a full-stack web application, robust backend development, or engaging frontend design, I'm here to bring your vision to life. From concept to deployment, I provide seamless integration, efficient workflows, and ongoing support to ensure your project's success.
    Driven by a desire to learn, innovate, and collaborate, I'm dedicated to delivering impactful tech solutions that exceed expectations. Let's connect and explore how we can work together to achieve your goals. Reach out today to discuss your freelance project needs! `,
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
          <Analytics />
          <HomeFooter />
        </Providers>
      </body>
    </html>
  );
}
