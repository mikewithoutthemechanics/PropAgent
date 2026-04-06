import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-side rendering (no static export)
  // This allows dynamic routes to work properly
  images: {
    unoptimized: true,
  },
  // Disable TypeScript errors during build (for now)
  typescript: {
    ignoreBuildErrors: true,
  },
  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

export default nextConfig;
