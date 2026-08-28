import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeseLaut — Deutsch durch Geschichten",
  description:
    "Deutsch lernen mit längeren Geschichten, Audio, Worterklärungen und Übungen für A1 – später auch A2 und B1.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <head><meta name="codex-preview" content="development" /></head>
      <body>{children}</body>
    </html>
  );
}
