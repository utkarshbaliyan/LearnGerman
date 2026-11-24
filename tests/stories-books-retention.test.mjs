import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';

const vite = await createServer({
  configFile: false,
  resolve: { alias: { '@': process.cwd() } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, ws: false, watch: null },
});
after(() => vite.close());

test('book catalog provides English subtitles, hooks, structured data, and reading time estimates', async () => {
  const { BOOK_CATALOG, bookForLevel, bookStructuredData, readingMinutes } = await vite.ssrLoadModule('/app/lib/book-catalog.ts');
  assert.equal(BOOK_CATALOG.length, 3);
  for (const level of ['A1', 'A2', 'B1']) {
    const entry = bookForLevel(level);
    assert.ok(entry, level);
    assert.ok(entry.englishTitle.length > 5);
    assert.ok(entry.hook.length > 20);
    assert.ok(entry.synopsis.length > 60);
    const schema = bookStructuredData(entry);
    assert.equal(schema['@type'], 'Book');
    assert.equal(schema.educationalLevel, level);
    assert.equal(schema.numberOfPages, 200);
    assert.equal(schema.isAccessibleForFree, true);
  }
  assert.equal(bookForLevel('B2'), undefined);
  assert.equal(readingMinutes(70), 1);
  assert.equal(readingMinutes(260), 2);
  assert.equal(readingMinutes(935), 7);
});

test('story pages use story watercolor artwork as Open Graph image while default metadata stays unchanged', async () => {
  const { generateMetadata } = await vite.ssrLoadModule('/app/stories/[storyId]/page.tsx');
  const meta = await generateMetadata({ params: Promise.resolve({ storyId: 'reading-a1-01-v1' }) });
  assert.match(meta.openGraph.images[0].url, /^https:\/\/leselaut\.com\/media\/illustrations\/stories\/reading-a1-01-v1-[a-f0-9]{12}\.webp$/);
  assert.equal(meta.twitter.images[0], meta.openGraph.images[0].url);
  const missing = await generateMetadata({ params: Promise.resolve({ storyId: 'reading-a1-999-v1' }) });
  assert.equal(missing.robots.index, false);
});

test('stories discovery includes 30-second level finder, reading times, unread filter, topic chips, and A1-B1 book cross-links', async () => {
  const { default: StoriesPage } = await vite.ssrLoadModule('/app/stories/page.tsx');
  const indexHtml = renderToStaticMarkup(await StoriesPage({ searchParams: Promise.resolve({}) }));
  assert.match(indexHtml, /Find your starting level in 30 seconds/);
  assert.match(indexHtml, /stories-card-goal/);
  assert.match(indexHtml, /~1 min · /);

  const { LevelLibrary } = await vite.ssrLoadModule('/app/stories/level-library.tsx');
  for (const [level, bookPath] of [
    ['A1', '/books/a1/der-schluessel-im-blauen-korb'],
    ['A2', '/books/a2/nicht-nur-ein-profil'],
    ['B1', '/books/b1/zwischen-hoersaal-und-arbeitswelt'],
  ]) {
    const html = renderToStaticMarkup(React.createElement(LevelLibrary, { level }));
    assert.match(html, new RegExp(`href="${bookPath}"`), `${level} level library links to its 200-page book`);
    assert.match(html, /Unread only/);
    assert.match(html, /class="reading-topic-chips"/);
    assert.match(html, /~\d+ min · /);
  }
});

test('books shelf, contents, reader, and Home card surface blurbs, Book schema, recaps, and custom narration player', async () => {
  const { default: BooksPage } = await vite.ssrLoadModule('/app/books/page.tsx');
  const shelf = renderToStaticMarkup(React.createElement(BooksPage));
  assert.match(shelf, /The Key in the Blue Basket/);
  assert.match(shelf, /Not Just a Profile/);
  assert.match(shelf, /Between Lecture Hall and Work/);

  for (const route of [
    '/app/books/a1/der-schluessel-im-blauen-korb/page.tsx',
    '/app/books/a2/nicht-nur-ein-profil/page.tsx',
    '/app/books/b1/zwischen-hoersaal-und-arbeitswelt/page.tsx',
  ]) {
    const { default: Contents } = await vite.ssrLoadModule(route);
    const html = renderToStaticMarkup(React.createElement(Contents));
    assert.match(html, /"@type":"Book"/);
    assert.match(html, /~1 min per page/);
  }

  const { default: A1Page } = await vite.ssrLoadModule('/app/books/a1/der-schluessel-im-blauen-korb/[page]/page.tsx');
  const page1 = renderToStaticMarkup(await A1Page({ params: Promise.resolve({ page: '1' }) }));
  assert.doesNotMatch(page1, /class="book-recap"/);
  assert.match(page1, /class="narration-play"/);
  assert.match(page1, /Back 5s/);
  assert.match(page1, /Restart/);

  const page2 = renderToStaticMarkup(await A1Page({ params: Promise.resolve({ page: '2' }) }));
  assert.match(page2, /class="book-recap"/);
  assert.match(page2, /Previously on Page 1/);

  const { HomeSections } = await vite.ssrLoadModule('/app/components/home-sections.tsx');
  const homeHtml = renderToStaticMarkup(React.createElement(HomeSections, {
    stories: [],
    completedIds: new Set(),
    storiesReady: true,
    vocabulary: { learnedKeys: [], reviewKeys: [], legacyMigrated: true },
    vocabularyReady: true,
    grammarLessons: [],
    memory: null,
    memoryLoading: false,
    memoryError: '',
    signedIn: false,
  }));
  assert.match(homeHtml, /data-area="books"/);
  assert.match(homeHtml, /Graded novels · A1–B1/);
});
