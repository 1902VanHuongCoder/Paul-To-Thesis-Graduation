import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "cdn-front.freepik.com",
      "www.shadcnblocks.com",
      "img.freepik.com",
      "cdn-icons-png.freepik.com",
      "www.congtyhai.com",
    ],
  },
  async redirects() {
    return [
      {
        source: "/((?!vi|en).*)", // Match all routes that do not start with /vi or /en
        destination: "/vi/homepage", // Redirect to /vi and preserve the path
        permanent: false, // Temporary redirect
      },
    ];
  },
};

export default nextConfig;