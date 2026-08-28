import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1–A2-Wortschatz — LeseLaut",
  description: "1.300 wichtige Wörter für A1 und A2 nach Themen lernen, aufdecken und zum Wiederholen markieren.",
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
