import type { MetadataRoute } from 'next';
import { READING_STORIES, READING_LEVELS } from './lib/reading-path';
import { RECEPTION_CATALOG } from './lib/reception-catalog';
import { storyLevelPath } from './lib/story-levels';
import { absoluteUrl } from './lib/seo';
import { ALL_GRAMMAR_LESSONS } from './grammar/course';
import { grammarLessonPath } from './grammar/seo';
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/stories', '/course', '/books', '/vocabulary', '/vocabulary/a1', '/vocabulary/a2', '/vocabulary/b1', '/vocabulary/sources', '/grammar', '/grammar/reference', '/grammar/cheat-sheets', '/stories/practice', '/about', '/privacy', '/support',
    ...READING_LEVELS.map(storyLevelPath), ...READING_STORIES.map(story => `/stories/${story.id}`),
    ...RECEPTION_CATALOG.map(lesson => `/stories/practice/${lesson.id}`), '/grammar/lessons',
    ...ALL_GRAMMAR_LESSONS.filter(lesson => lesson.released).map(lesson => grammarLessonPath(lesson.id))];
  // Book contents pages only; single pages are noindex (see bookPageMetadata).
  paths.push('/books/a1/der-schluessel-im-blauen-korb', '/books/a2/nicht-nur-ein-profil', '/books/b1/zwischen-hoersaal-und-arbeitswelt');
  // Exclude session URLs, filters and retired editions; do not invent modification dates.
  return [...new Set(paths)].map(path => ({ url: absoluteUrl(path) }));
}
