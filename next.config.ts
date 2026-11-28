import type { NextConfig } from "next";
import securityHeaders from './deploy/security-headers.json';

const nextConfig: NextConfig = {
  ...(process.env.LESELAUT_BUILD_TARGET === 'aws' ? { output: 'standalone' as const } : {}),
  poweredByHeader: false,
  async headers() {
    // Local dev runs on plain http://localhost: Safari would upgrade every asset to https and the page loads
    // without CSS/JS, so drop the HTTPS-only parts there. Production headers are unchanged.
    const dev = process.env.NODE_ENV !== 'production';
    const headers = Object.entries(securityHeaders)
      .filter(([key]) => !(dev && key === 'Strict-Transport-Security'))
      .map(([key, value]) => ({ key, value: dev && key === 'Content-Security-Policy' ? value.replace(/;\s*upgrade-insecure-requests/, '') : value }));
    // The locked Vinext matcher treats /:path* as non-empty and skips the homepage.
    return [{ source: '/', headers }, { source: '/:path*', headers }];
  },
};

export default nextConfig;
