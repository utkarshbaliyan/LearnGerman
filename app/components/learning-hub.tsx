'use client';
import type { ReadingSummary } from '@/app/lib/reading-path';
import type { HomeGrammarLesson } from '@/app/lib/home-progress';
import { TodayDashboard } from './today-dashboard';
import Link from 'next/link';
import type { StoryPreviewData } from './story-preview';

export function LearningHub({ stories, initialView, grammarLessons, preview }: { preview: StoryPreviewData; stories: ReadingSummary[]; initialView: 'today' | 'review'; grammarLessons: HomeGrammarLesson[] }) {
  return <main className="learning-page learning-hub"><header className="home-welcome"><span className="reading-eyebrow">German through stories · A1 to B2</span><h1>Learn German, one story at a time.</h1><p>Read and listen to {stories.length} free German stories, check English translations and build your vocabulary. Add grammar practice and word review to your daily routine.</p><ul className="home-facts" aria-label="What LeseLaut includes"><li><strong>{stories.length}</strong> stories with audio</li><li><strong>3</strong> graded books</li><li><strong>{grammarLessons.length}</strong> grammar lessons</li><li><strong>Free</strong> · no sign-up needed</li></ul><nav className="discovery-actions" aria-label="Start learning German"><Link href="/stories">Explore German stories →</Link><Link href="/course">Follow the German course →</Link></nav></header>
    <TodayDashboard preview={preview} stories={stories} grammarLessons={grammarLessons} initialReview={initialView === 'review'} />
  </main>;
}
