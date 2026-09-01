import { CourseHome } from "@/app/components/course-home";
import { COURSE_LEVELS } from "@/app/course/course-data";
import { ALL_GRAMMAR_LESSONS, GRAMMAR_MODULES } from "@/app/grammar/course";

export default function CoursePage() {
  return (
    <CourseHome
      courseLevels={COURSE_LEVELS}
      grammarModules={GRAMMAR_MODULES}
      allGrammarLessons={ALL_GRAMMAR_LESSONS}
    />
  );
}
