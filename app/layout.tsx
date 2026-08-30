import type { Metadata } from "next";
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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
