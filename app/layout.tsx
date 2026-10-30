import type { Metadata, Viewport } from "next";
import { CloudProgressSync } from "@/app/components/cloud-progress-sync";
import { SiteFooter } from '@/app/components/site-footer';
import { RumMonitoring } from '@/app/components/rum-monitoring';
import { ResponsiveAudit } from '@/app/components/responsive-audit';
import "./globals.css";
import "./illustrated-ui.css";
import './learning.css';
import './recall-decks.css';
import './home-sections.css';
import './grammar-learning.css';
import './grammar-guide.css';
import './launch-readiness.css';
import './discovery.css';
import './site-menu.css';
import './account/account-simple.css';
import './vocabulary/word-list.css';
import './platform-colours.css';
import './responsive.css';
import { SITE_ORIGIN, SITE_DESCRIPTION } from './lib/seo';
import { isStaging } from './lib/staging-safety.mjs';
import analytics from '@/deploy/cloudflare/analytics-public.json';
import securityHeaders from '@/deploy/security-headers.json';
import { PUBLIC_ANALYTICS_PATH } from './lib/rum-privacy';

const analyticsStopPolicy = securityHeaders['Content-Security-Policy'].split(';').find(value => value.trim().startsWith('connect-src '))?.replace(' https://cloudflareinsights.com/cdn-cgi/rum', '').trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: 'LeseLaut',
  title: 'Learn German with Stories, Audio & Practice | LeseLaut',
  description: SITE_DESCRIPTION,
  ...(isStaging() ? { robots: { index: false, follow: false } } : {}),
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: "/favicon.svg",
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf9" },
    { media: "(prefers-color-scheme: dark)", color: "#141b1a" },
  ],
};

const themeScript = `(() => {
  try {
    const saved = localStorage.getItem("leselaut:theme");
    const theme = saved === "light" || saved === "dark"
      ? saved
      : matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {}
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script suppressHydrationWarning id="leselaut-analytics-boundary" src="/analytics-boundary.js" data-analytics-hosts={analytics.enabled && !isStaging() ? analytics.hosts.join(',') : ''} data-analytics-public-pattern={PUBLIC_ANALYTICS_PATH.source} data-analytics-stop-policy={analyticsStopPolicy} />
      </head>
      <body>
        {isStaging() && <aside role="status" style={{ padding: '12px 20px', background: '#fff2c7', color: '#322800', textAlign: 'center' }}>
          Test site — use a separate test account. Your main account is at <a href="https://leselaut.com" style={{ textDecoration: 'underline' }}>leselaut.com</a>.
        </aside>}
        <CloudProgressSync />{children}<RumMonitoring /><SiteFooter />
        {process.env.NODE_ENV !== 'production' && process.env.LESELAUT_LAYOUT_AUDIT === '1' && <ResponsiveAudit />}
      </body>
    </html>
  );
}
