import type { Metadata, Viewport } from "next";
import { CloudProgressSync } from "@/app/components/cloud-progress-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeseLaut — Learn German through stories",
  description:
    "Follow a structured A1–B1 German course with stories, built-in audio, vocabulary, word help, and saved progress.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#101114" },
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
