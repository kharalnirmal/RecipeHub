import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.themealdb.com",
        // Next.js blocks external images by default for security.
        // Explicitly whitelist domains you trust.
      },
    ],
  },
};

export default nextConfig;
