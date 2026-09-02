import type { Metadata } from "next";

import { VOCABULARY_LEVEL_COUNTS } from "@/app/vocabulary/data";

export const metadata: Metadata = {
  title: "A1–B1 Vocabulary — LeseLaut",
  description: `Study ${VOCABULARY_LEVEL_COUNTS.all.toLocaleString("en")} deduplicated A1–B1 German vocabulary cards by level, topic, word class, and verb type.`,
};

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
