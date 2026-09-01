import { notFound } from "next/navigation";

import { IntegratedCourseChapter } from "@/app/components/integrated-course-chapter";
import { CHAPTERS_PER_LEVEL, COURSE_LEVELS, getCourseChapter } from "@/app/course/course-data";
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
  const content = getCourseChapter(level, number);
  if (!content) notFound();

  return <IntegratedCourseChapter content={content} />;
}
