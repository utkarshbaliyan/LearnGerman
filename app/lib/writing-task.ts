import { getPracticeTask } from "./tutor-practice";
import { TUTOR_PATTERNS } from "./tutor-patterns";
import { getCourseChapter } from "@/app/course/course-data";
import { writingMission } from "./writing-mission";

export function getWritingTask(taskId: string) {
  const practice = getPracticeTask(taskId);
  if (practice) return { level: practice.level, chapter: 1, prompt: practice.prompt, grammarFocus: TUTOR_PATTERNS[practice.patternId].label, vocabulary: [], targetPattern: practice.patternId };
  const match = /^(a1|a2|b1)-([1-4])-([1-6])$/.exec(taskId);
  if (!match) return null;
  const content = getCourseChapter(match[1], (Number(match[2]) - 1) * 6 + Number(match[3]));
  if (!content) return null;
  return { level: content.level, chapter: content.number, prompt: writingMission(content),
    grammarFocus: `${content.lesson.title}: ${content.grammar.pattern}`,
    vocabulary: content.vocabulary.slice(0, 20).map((word) => word.german) };
}
