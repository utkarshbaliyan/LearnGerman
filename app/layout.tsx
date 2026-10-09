import type { Metadata, Viewport } from "next";
import { CloudProgressSync } from "@/app/components/cloud-progress-sync";
import "./globals.css";
import "./illustrated-ui.css";
import './learning.css';
import './platform-colours.css';
import './recall-decks.css';

export const metadata: Metadata = {
  title: "LeseLaut — Learn German through stories",
  description:
    "Learn German with illustrated story libraries, narrated books, vocabulary, grammar practice, and saved progress.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
      <body><CloudProgressSync />{children}</body>
    </html>
  );
}
