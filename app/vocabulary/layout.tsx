import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1–B1-Wortschatz — LeseLaut",
  description: "2.400 häufige Wörter und Ausdrücke für A1 bis B1 nach Themen lernen, aufdecken und zum Wiederholen markieren.",
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
