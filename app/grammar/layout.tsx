import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1–B1 German Grammar — LeseLaut",
  description: "Learn German grammar from A1 to B1 with clear explanations, worked examples, varied exercises, and saved mastery progress.",
};

export default function GrammarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
