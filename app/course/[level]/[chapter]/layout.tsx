import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrated German Course Chapter · LeseLaut",
  description: "A complete German course chapter combining listening, reading, vocabulary, grammar, speaking, writing, and a mastery checkpoint.",
};

export default function CourseChapterLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
