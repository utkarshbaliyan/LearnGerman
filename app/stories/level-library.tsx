import { READING_STORIES, READING_SECTIONS, READING_SECTION_GOALS, readingSummary, type ReadingLevel } from '@/app/lib/reading-path';
import { STORY_LEVELS, storyLevelPath } from '@/app/lib/story-levels';
import { pageMetadata, breadcrumbs } from '@/app/lib/seo';
import { StructuredData } from '@/app/components/structured-data';
import { ReadingPath } from './reading-path';
export const levelMetadata = (level: ReadingLevel) => pageMetadata(STORY_LEVELS[level].title, STORY_LEVELS[level].description, storyLevelPath(level));
export function LevelLibrary({ level }: { level: ReadingLevel }) {
  return <><StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German stories', path: '/stories' }, { name: `${level} German stories`, path: storyLevelPath(level) }])} />
    <ReadingPath key={level} stories={READING_STORIES.filter(story => story.level === level).map(readingSummary)} sections={READING_SECTIONS} goals={READING_SECTION_GOALS} initialLevel={level} /></>;
}
