import { getChapterOutputTask } from "./chapter-output-tasks";
import { getCourseChapter } from "@/app/course/course-data";
import type { TutorPatternId } from "./tutor-patterns";
export type SpeakingMission = { id: string; title: string; goal: string; role: string; opening: string; patternId: TutorPatternId; level: "A1" | "A2" | "B1"; turns: number; chapter: number; questions: string[]; support?: string; speakingSize: string; rubric: string; grammarFocus: string };
export function getSpeakingMission(taskId: string): SpeakingMission | null {
  const task = getChapterOutputTask(taskId);
  if (!task) return null;
  const chapter = getCourseChapter(task.level, task.chapter)!;
  return { id: `chapter-v2-${taskId}`, title: task.title, goal: task.writing.replace(/^Write /, "Say "), role: "a patient practice partner", opening: task.questions[0], patternId: "other", level: task.level, turns: task.questions.length, chapter: task.chapter, questions: task.questions, support: task.starter, speakingSize: task.speakingSize, rubric: task.rubric, grammarFocus: `${chapter.lesson.title}: ${chapter.grammar.pattern}` };
}
export type SpeakingState = {
  missionId?: string;
  mode: "conversation" | "focus"; startedAt: string; ended: boolean;
  turns: { id: string; prompt: string; originalTranscript: string; text: string; reply: string; createdAt: string }[];
  transcript?: { id: string; original: string; text: string; consentAt: string; consumed: boolean };
  requests: { id: string; hash: string; action: string; status: "pending" | "complete" | "failed"; createdAt: string }[];
};
