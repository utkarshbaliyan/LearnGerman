'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ReadingSummary } from '@/app/lib/reading-path';
import type { HomeGrammarLesson } from '@/app/lib/home-progress';
import { TodayDashboard } from './today-dashboard';
import { PersonalReview } from './personal-review';

export function LearningHub({ stories, initialView, grammarLessons }: { stories: ReadingSummary[]; initialView: 'today' | 'review'; grammarLessons: HomeGrammarLesson[] }) {
  const [view, setView] = useState(initialView);
  const router = useRouter();
  useEffect(() => setView(initialView), [initialView]);
  return <main className="learning-page learning-hub"><h1 className="sr-only">Home</h1>
    <Tabs value={view} onValueChange={value => { const next = value === 'review' ? 'review' : 'today'; setView(next); router.replace(next === 'review' ? '/?view=review' : '/', { scroll: false }); }}>
      <TabsList className="learning-hub-tabs" aria-label="Today and Review"><TabsTrigger value="today">Today</TabsTrigger><TabsTrigger value="review">Review</TabsTrigger></TabsList>
      <TabsContent value="today" forceMount hidden={view !== 'today'}><TodayDashboard stories={stories} grammarLessons={grammarLessons} /></TabsContent>
      <TabsContent value="review" forceMount hidden={view !== 'review'}><PersonalReview /></TabsContent>
    </Tabs>
  </main>;
}
