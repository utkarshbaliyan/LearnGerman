import { SiteHeader } from './components/site-header';
import { LearningHub } from './components/learning-hub';
import { READING_STORIES, readingSummary } from './lib/reading-path';

export default async function HomePage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  return <div className="site-shell"><SiteHeader active="today" /><LearningHub initialView={view === 'review' ? 'review' : 'today'} stories={READING_STORIES.map(readingSummary)} /></div>;
}
