import { IntegratedCourseChapter } from "@/app/components/integrated-course-chapter";
import { getCourseChapter } from "@/app/course/course-data";

export default function ChapterOnePage() {
  return <IntegratedCourseChapter content={getCourseChapter("A1", 1)!} />;
}
