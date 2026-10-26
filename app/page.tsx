import { SiteHeader } from './components/site-header';
import { LearningHub } from './components/learning-hub';
import { READING_STORIES, readingSummary } from './lib/reading-path';
import { ALL_GRAMMAR_LESSONS, LIVE_GRAMMAR_LESSONS } from './grammar/course';
import { pageMetadata, SITE_DESCRIPTION, website } from './lib/seo';
import { StructuredData } from './components/structured-data';

export const metadata = pageMetadata('Learn German with Stories, Audio & Practice', SITE_DESCRIPTION, '/');

export default async function HomePage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const grammarLessons = ALL_GRAMMAR_LESSONS.filter(l => l.released).map(l => ({ id: l.id, title: l.title, requiredSets: [...new Set(LIVE_GRAMMAR_LESSONS[l.id].exercises.map(e => e.group ?? 'Core practice'))] }));
  return <div className="site-shell"><StructuredData data={website} /><SiteHeader active="today" /><LearningHub initialView={view === 'review' ? 'review' : 'today'} stories={READING_STORIES.map(readingSummary)} grammarLessons={grammarLessons} /></div>;
}
