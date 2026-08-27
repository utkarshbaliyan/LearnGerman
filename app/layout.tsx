import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeseLaut German",
  description:
    "Turn a German lesson into an A2 story you can read, hear, hover, and practise.",
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
