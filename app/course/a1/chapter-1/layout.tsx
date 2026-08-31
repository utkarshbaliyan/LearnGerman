import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1 Chapter 1: Ich bin neu hier — LeseLaut",
  description: "Master introductions through integrated German listening, reading, vocabulary, grammar, speaking, and writing practice.",
};

export default function ChapterOneLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
