import type { Metadata, Viewport } from "next";
import { CloudProgressSync } from "@/app/components/cloud-progress-sync";
import { SiteFooter } from '@/app/components/site-footer';
import "./globals.css";
import "./illustrated-ui.css";
import './learning.css';
import './platform-colours.css';
import './recall-decks.css';
import './home-sections.css';
import './grammar-learning.css';
import './grammar-guide.css';
import './launch-readiness.css';
import './discovery.css';
import { SITE_ORIGIN, SITE_DESCRIPTION } from './lib/seo';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  applicationName: 'LeseLaut',
  title: 'Learn German with Stories, Audio & Practice | LeseLaut',
  description: SITE_DESCRIPTION,
  icons: {
    icon: [{ url: '/icon-192.png', sizes: '192x192', type: 'image/png' }, { url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: "/favicon.svg",
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
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
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body><CloudProgressSync />{children}<SiteFooter /></body>
    </html>
  );
}
