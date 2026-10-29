import type { NextConfig } from "next";
import securityHeaders from './deploy/security-headers.json';

const nextConfig: NextConfig = {
  ...(process.env.LESELAUT_BUILD_TARGET === 'aws' ? { output: 'standalone' as const } : {}),
  poweredByHeader: false,
  async headers() {
    const headers = Object.entries(securityHeaders).map(([key, value]) => ({ key, value }));
    // The locked Vinext matcher treats /:path* as non-empty and skips the homepage.
    return [{ source: '/', headers }, { source: '/:path*', headers }];
  },
};

export default nextConfig;
