import type { CourseChapterContent } from "@/app/course/course-data";

export function writingMission(content: CourseChapterContent) {
  if (content.level === "A1" && content.number === 1) return "You are joining a German course. Write a message to your new classmates: introduce yourself, say where you live and which languages you speak, and ask one question to start a conversation.";
  const outcome = content.story.canDo;
  return `Write a message to a German-speaking friend about “${content.story.theme}”. Your goal: ${outcome} Include a concrete detail from your own life (you may invent it), explain what you want or need, and ask a question your friend can answer. Use the chapter’s grammar where it fits naturally.`;
}

