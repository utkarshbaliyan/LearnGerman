import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "A1–C1 German Grammar — LeseLaut",
  description: "Learn German grammar from A1 to C1 with clear explanations, worked examples, varied exercises, and saved practice progress.",
};

export default function GrammarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
