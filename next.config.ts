import type { NextConfig } from "next";
import securityHeaders from './deploy/security-headers.json';

const nextConfig: NextConfig = {
  ...(process.env.LESELAUT_BUILD_TARGET === 'aws' ? { output: 'standalone' as const } : {}),
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: Object.entries(securityHeaders).map(([key, value]) => ({ key, value })) }];
  },
};

export default nextConfig;
