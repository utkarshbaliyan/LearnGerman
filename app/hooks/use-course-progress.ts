"use client";

import { useCallback, useEffect, useState } from "react";

import {
  COURSE_PROGRESS_STORAGE_KEY,
  mergeCourseProgressWithGrammar,
  readCourseProgress,
  readGrammarProgress,
} from "@/app/lib/progress-sync";
import { PROGRESS_SYNCED_EVENT } from "@/app/lib/cloud-progress-keys";
import { queueCloudProgress } from "@/app/lib/cloud-progress-save";

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

export type CourseProgress = {
  chapters: Record<string, ChapterProgress>;
};

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
    const refresh = () => {
      const merged = mergeCourseProgressWithGrammar(readCourseProgress(localStorage), readGrammarProgress(localStorage));
      setProgress({
        chapters: Object.fromEntries(Object.entries(merged.chapters).map(([chapterId, chapter]) => [chapterId, {
          ...EMPTY_CHAPTER_PROGRESS,
          ...chapter,
          skillScores: { ...EMPTY_CHAPTER_PROGRESS.skillScores, ...(chapter.skillScores ?? {}) },
          grammarSets: { ...EMPTY_CHAPTER_PROGRESS.grammarSets, ...(chapter.grammarSets ?? {}) },
          knownWords: Array.isArray(chapter.knownWords) ? chapter.knownWords : [],
        }])) as Record<string, ChapterProgress>,
      });
      setHydrated(true);
    };
    const frame = requestAnimationFrame(refresh);
    window.addEventListener(PROGRESS_SYNCED_EVENT, refresh);
    return () => { cancelAnimationFrame(frame); window.removeEventListener(PROGRESS_SYNCED_EVENT, refresh); };
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
      queueCloudProgress("course", progress);
    }
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
