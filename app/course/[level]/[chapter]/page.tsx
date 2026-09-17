import { notFound, redirect } from "next/navigation";

import { CHAPTERS_PER_LEVEL, COURSE_LEVELS } from "@/app/course/course-data";
import type { GrammarLevel } from "@/app/grammar/course";

function parseChapter(value: string) {
  const match = /^chapter-(\d+)$/.exec(value);
  return match ? Number(match[1]) : Number.NaN;
}

export default async function CourseChapterPage({ params }: { params: Promise<{ level: string; chapter: string }> }) {
  const { level: rawLevel, chapter: rawChapter } = await params;
  const level = rawLevel.toUpperCase() as GrammarLevel;
  const number = parseChapter(rawChapter);

  if (!COURSE_LEVELS.includes(level) || number < 1 || number > CHAPTERS_PER_LEVEL) notFound();
  redirect(`/stories/reading-${level.toLowerCase()}-${String(number).padStart(2, "0")}-v1`);
}
