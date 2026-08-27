import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeseLaut — 100 German Stories for A1",
  description:
    "Learn A1 German through 100 longer, CEFR-aligned stories with 800+ useful words, slow audio and instant English word meanings.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
