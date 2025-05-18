import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cdn-front.freepik.com",
      "www.shadcnblocks.com",
      "img.freepik.com",
      "cdn-icons-png.freepik.com",
      "www.congtyhai.com",
      "shadcnblocks.com",
    ],
  },
  // next.config.ts
  async redirects() {
    return [
      { source: "/", destination: "/vi/homepage", permanent: false },
      // Only redirect if NOT starting with /vi or /en
      {
        source: "/((?!vi|en).*)",
        destination: "/vi/$1",
        permanent: false,
      },
    ];
  }
};

export default nextConfig;