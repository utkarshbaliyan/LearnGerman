import { READING_STORIES, READING_SECTIONS, READING_SECTION_GOALS, readingSummary, type ReadingLevel } from '@/app/lib/reading-path';
import { ReadingPath } from './reading-path';
export const metadata = { title: 'Stories · LeseLaut', description: 'Short German stories that grow with you from A1 to B1, with vocabulary in context and reading practice.' };
export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ level?: string }> }) {
  const requested = (await searchParams).level?.toUpperCase();
  const initialLevel: ReadingLevel = requested === 'A2' || requested === 'B1' ? requested : 'A1';
  return <ReadingPath stories={READING_STORIES.map(readingSummary)} sections={READING_SECTIONS} goals={READING_SECTION_GOALS} initialLevel={initialLevel} />;
}
