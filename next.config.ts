import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
