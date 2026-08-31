import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1–B1 Vocabulary — LeseLaut",
  description: "Study 2,400 essential A1–B1 German words by level and category, then track learned and review words.",
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
