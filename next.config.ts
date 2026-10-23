import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.LESELAUT_BUILD_TARGET === 'aws' ? { output: 'standalone' as const } : {}),
  /* config options here */
};

export default nextConfig;
