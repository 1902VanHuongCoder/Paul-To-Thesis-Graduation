import type { NextConfig } from "next";
import { i18n } from './next-i18next.config';
const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ["cdn-front.freepik.com", "www.shadcnblocks.com", "img.freepik.com", "cdn-icons-png.freepik.com"], // Add the external domain here
  },
   i18n,
};

export default nextConfig;
