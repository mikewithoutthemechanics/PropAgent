import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server-side rendering (no static export)
  // This allows dynamic routes to work properly
  images: {
    unoptimized: true,
  },
  // Environment variables available at build time
  env: {
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
  // TypeScript and ESLint checks run during build.
  // Do NOT set ignoreBuildErrors or ignoreDuringBuilds in production.
};

export default nextConfig;
