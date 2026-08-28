import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1-Wortschatz — LeseLaut",
  description: "800 wichtige A1-Wörter nach Themen lernen, aufdecken und zum Wiederholen markieren.",
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
