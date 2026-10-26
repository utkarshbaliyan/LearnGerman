import type { MetadataRoute } from 'next';
import { READING_STORIES, READING_LEVELS } from './lib/reading-path';
import { RECEPTION_CATALOG } from './lib/reception-catalog';
import { storyLevelPath } from './lib/story-levels';
import { absoluteUrl } from './lib/seo';
import { ALL_GRAMMAR_LESSONS } from './grammar/course';
import a1 from './lib/book-data.json';
import a2 from '../content/books/nicht-nur-ein-profil/book.json';
import b1 from '../content/books/zwischen-hoersaal-und-arbeitswelt/book.json';
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ['/', '/stories', '/course', '/books', '/vocabulary', '/vocabulary/sources', '/grammar', '/grammar/reference', '/grammar/cheat-sheets', '/stories/practice', '/about', '/privacy', '/support',
    ...READING_LEVELS.map(storyLevelPath), ...READING_STORIES.map(story => `/stories/${story.id}`),
    ...RECEPTION_CATALOG.map(lesson => `/stories/practice/${lesson.id}`), '/grammar/lessons',
    ...ALL_GRAMMAR_LESSONS.filter(lesson => lesson.released).map(lesson => `/grammar/lessons/${lesson.id}`)];
  for (const [base, book] of [['/books/a1/der-schluessel-im-blauen-korb', a1], ['/books/a2/nicht-nur-ein-profil', a2], ['/books/b1/zwischen-hoersaal-und-arbeitswelt', b1]] as const) {
    paths.push(base, ...book.pages.map(page => `${base}/${page.number}`));
  }
  // Exclude session URLs, filters and retired editions; do not invent modification dates.
  return [...new Set(paths)].map(path => ({ url: absoluteUrl(path) }));
}
