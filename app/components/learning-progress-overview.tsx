"use client";

import { useEffect, useMemo, useState } from "react";

import { getCurriculum, LEVELS as CURRICULUM_LEVELS } from "@/app/curriculum";
import { useStoryProgress } from "@/app/hooks/use-story-progress";
import { useVocabularyProgress } from "@/app/hooks/use-vocabulary-progress";
import { PROGRESS_SYNCED_EVENT } from "@/app/lib/cloud-progress-keys";
import { readGrammarProgress } from "@/app/lib/progress-sync";
import { ALL_VOCABULARY } from "@/app/vocabulary/data";
import { Progress } from "@/components/ui/progress";

export function LearningProgressOverview({ completedChapters, chapterTotal, grammarLessonIds, courseReady }: {
  completedChapters: number;
  chapterTotal: number;
  grammarLessonIds: string[];
  courseReady: boolean;
}) {
  const { completedIds, hydrated: storiesHydrated } = useStoryProgress();
  const { isLearned, hydrated: vocabularyHydrated } = useVocabularyProgress(ALL_VOCABULARY);
  const [completedGrammarIds, setCompletedGrammarIds] = useState<string[]>([]);
  const [grammarReady, setGrammarReady] = useState(false);
  const availableStories = useMemo(() => CURRICULUM_LEVELS.flatMap((level) => getCurriculum(level.id)?.stories ?? []), []);

  useEffect(() => {
    const refresh = () => { setCompletedGrammarIds(readGrammarProgress(localStorage).completed); setGrammarReady(true); };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); };
  }, []);

  const items = [
    { label: "Course", value: completedChapters, total: chapterTotal, suffix: "chapters", ready: courseReady },
    { label: "Stories", value: availableStories.filter((story) => completedIds.has(story.id)).length, total: availableStories.length, suffix: "stories", ready: storiesHydrated },
    { label: "Grammar", value: grammarLessonIds.filter((id) => completedGrammarIds.includes(id)).length, total: grammarLessonIds.length, suffix: "lessons", ready: grammarReady },
    { label: "Vocabulary", value: ALL_VOCABULARY.filter(isLearned).length, total: ALL_VOCABULARY.length, suffix: "words", ready: vocabularyHydrated },
  ];

  return <section className="learning-progress-overview" aria-labelledby="learning-progress-title">
    <div className="course-section-heading"><span>Your learning data</span><h2 id="learning-progress-title">Progress across every part of LeseLaut.</h2><p>Each graph uses its own completed items, so a story, grammar lesson, vocabulary card, and full course chapter are counted separately and accurately.</p></div>
    <div className="learning-progress-grid">
      {items.map((item) => {
        const percent = item.total ? Math.round((item.value / item.total) * 100) : 0;
        return <article key={item.label} className={item.ready ? "is-ready" : ""}>
          <div><span>{item.label}</span><strong>{percent}%</strong></div>
          <Progress value={percent} aria-label={`${item.label}: ${percent}% complete`} />
          <p>{item.value.toLocaleString("en")} of {item.total.toLocaleString("en")} {item.suffix} completed</p>
        </article>;
      })}
    </div>
  </section>;
}
