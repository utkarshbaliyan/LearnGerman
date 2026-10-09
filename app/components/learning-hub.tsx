'use client';
import type { ReadingSummary } from '@/app/lib/reading-path';
import type { HomeGrammarLesson } from '@/app/lib/home-progress';
import { TodayDashboard } from './today-dashboard';

export function LearningHub({ stories, initialView, grammarLessons }: { stories: ReadingSummary[]; initialView: 'today' | 'review'; grammarLessons: HomeGrammarLesson[] }) {
  return <main className="learning-page learning-hub"><h1 className="sr-only">Home</h1>
    <TodayDashboard stories={stories} grammarLessons={grammarLessons} initialReview={initialView === 'review'} />
  </main>;
}
