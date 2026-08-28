import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeseLaut — Deutsch durch Geschichten",
  description:
    "Deutsch lernen mit Geschichten, Audio, Worterklärungen und Übungen von A1 bis B1.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
