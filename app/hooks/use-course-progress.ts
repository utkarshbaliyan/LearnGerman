"use client";

import { useCallback, useEffect, useState } from "react";

export const COURSE_SKILLS = ["reading", "listening", "vocabulary", "grammar", "speaking", "writing"] as const;
export type CourseSkill = (typeof COURSE_SKILLS)[number];

export type ChapterProgress = {
  completed: boolean;
  checkpointScore: number;
  skillScores: Partial<Record<CourseSkill, number>>;
  grammarSets: Record<string, number>;
  knownWords: string[];
  writingDraft: string;
  recordedSpeaking: boolean;
};

type CourseProgress = {
  chapters: Record<string, ChapterProgress>;
};

const STORAGE_KEY = "leselaut:course-progress:v1";

export const EMPTY_CHAPTER_PROGRESS: ChapterProgress = {
  completed: false,
  checkpointScore: 0,
  skillScores: {},
  grammarSets: {},
  knownWords: [],
  writingDraft: "",
  recordedSpeaking: false,
};

export function useCourseProgress() {
  const [progress, setProgress] = useState<CourseProgress>({ chapters: {} });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") as Partial<CourseProgress>;
        setProgress({ chapters: stored.chapters && typeof stored.chapters === "object" ? stored.chapters : {} });
      } catch {
        setProgress({ chapters: {} });
      }
      setHydrated(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [hydrated, progress]);

  const updateChapter = useCallback((chapterId: string, update: (chapter: ChapterProgress) => ChapterProgress) => {
    setProgress((current) => ({
      chapters: {
        ...current.chapters,
        [chapterId]: update(current.chapters[chapterId] ?? EMPTY_CHAPTER_PROGRESS),
      },
    }));
  }, []);

  const setSkillScore = useCallback((chapterId: string, skill: CourseSkill, score: number) => {
    updateChapter(chapterId, (chapter) => ({
      ...chapter,
      skillScores: { ...chapter.skillScores, [skill]: Math.max(chapter.skillScores[skill] ?? 0, Math.round(score)) },
    }));
  }, [updateChapter]);

  return { progress, hydrated, updateChapter, setSkillScore };
}
