import type { CourseChapterContent } from "@/app/course/course-data";
import { getChapterOutputTask } from "./chapter-output-tasks";
export function writingMission(content: CourseChapterContent) { return getChapterOutputTask(content.id)!.writing; }
