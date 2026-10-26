import { readingEditionId } from '@/app/lib/reading-progress';
import { notFound, permanentRedirect } from "next/navigation";
import { absoluteUrl } from '@/app/lib/seo';

import { CHAPTERS_PER_LEVEL, COURSE_LEVELS, type CourseLevel } from "@/app/course/course-data";

function parseChapter(value: string) {
  const match = /^chapter-(\d+)$/.exec(value);
  return match ? Number(match[1]) : Number.NaN;
}

export default async function CourseChapterPage({ params }: { params: Promise<{ level: string; chapter: string }> }) {
  const { level: rawLevel, chapter: rawChapter } = await params;
  const level = rawLevel.toUpperCase() as CourseLevel;
  const number = parseChapter(rawChapter);

  if (!COURSE_LEVELS.includes(level) || !Number.isInteger(number) || number < 1 || number > CHAPTERS_PER_LEVEL) notFound();
  permanentRedirect(absoluteUrl(`/stories/${readingEditionId(level, number)}`));
}
