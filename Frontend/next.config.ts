import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true,
    domains: [
      "cdn-front.freepik.com",
      "www.shadcnblocks.com",
      "img.freepik.com",
      "cdn-icons-png.freepik.com",
      "www.congtyhai.com",
      "shadcnblocks.com",
      "res.cloudinary.com",
      "lh3.googleusercontent.com",
    ],
  },
  // next.config.ts
  async redirects() {
    return [
      { source: "/", destination: "/vi/homepage", permanent: false },
      // Only redirect if NOT starting with /vi or /en
    ];
  },
  devIndicators: {
    buildActivity: false, // Hides the build activity indicator
    buildActivityPosition: "bottom-right", // Optional: customize position if buildActivity is true
  },
};

export default nextConfig;
