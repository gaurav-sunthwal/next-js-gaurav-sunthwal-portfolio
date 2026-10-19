import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Put the CSS inside each page's HTML instead of a separate file. Pages render
    // faster for first-time visitors, and Microsoft Clarity records the styles with
    // the page, so session replays look exactly like the real site.
    inlineCss: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  // Old pages from the previous design now live as sections on the home page.
  async redirects() {
    return [
      { source: "/experience", destination: "/#work", permanent: true },
      { source: "/skills", destination: "/#skills", permanent: true },
    ];
  },
};

export default nextConfig;
