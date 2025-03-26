import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  images: {unoptimized: true},
  typescript: {
    // This ignores TypeScript errors during the build process
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
