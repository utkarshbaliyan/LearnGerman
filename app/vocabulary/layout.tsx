import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1–B1 Vocabulary — LeseLaut",
  description: "Study 5,000 A1–B1 German vocabulary cards by level, topic, word class, and verb type, with synchronized learning progress.",
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
