import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'vite';

const root = resolve(import.meta.dirname, '..');
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const wordCount = (text) => text.trim().split(/\s+/u).filter(Boolean).length;

async function directoryBytes(path) {
  let total = 0;
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const location = resolve(path, entry.name);
    total += entry.isDirectory() ? await directoryBytes(location) : (await stat(location)).size;
  }
  return total;
}

const stories = [
  ...await readJson('app/lib/reading-path-data.json'),
  ...await readJson('app/lib/reading-expanded-data.json'),
];
const books = [await readJson('app/lib/book-data.json')];
const storyAudio = await readJson('app/lib/reading-audio-manifest.json');
const server = await createServer({
  root,
  configFile: false,
  appType: 'custom',
  resolve: { alias: { '@': root } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, ws: false },
});

try {
  const { ALL_VOCABULARY } = await server.ssrLoadModule('/app/vocabulary/data.ts');
  const { ALL_GRAMMAR_LESSONS } = await server.ssrLoadModule('/app/grammar/course.ts');
  const ranges = { A1: [70, 200], A2: [200, 400], B1: [600, 800] };
  const levels = ['A1', 'A2', 'B1', 'B2', 'C1'];
  const storyLevels = Object.fromEntries(levels.map((level) => {
    const [min, max] = ranges[level] ?? [null, null];
    const lengths = stories.filter((story) => story.level === level).map((story) => wordCount(story.text)).sort((a, b) => a - b);
    return [level, {
      count: lengths.length,
      min: lengths[0] ?? null,
      median: lengths.length ? lengths[Math.floor(lengths.length / 2)] : null,
      max: lengths.at(-1) ?? null,
      belowTarget: min === null ? null : lengths.filter((length) => length < min).length,
      aboveTarget: max === null ? null : lengths.filter((length) => length > max).length,
    }];
  }));
  const vocabularyLevels = Object.fromEntries(levels.map((level) => [level, ALL_VOCABULARY.filter((word) => word.level === level).length]));
  const grammarLevels = Object.fromEntries(levels.map((level) => [level, ALL_GRAMMAR_LESSONS.filter((lesson) => lesson.id.startsWith(`${level.toLowerCase()}-`) && lesson.released).length]));
  const vocabularyPairs = new Set(ALL_VOCABULARY.map((word) => `${word.german.trim().toLocaleLowerCase('de-DE')}\u0000${word.english.trim().toLocaleLowerCase('en')}`));
  const audioBytes = await directoryBytes(resolve(root, 'public/audio'));
  const result = {
    stories: { total: stories.length, distinctIds: new Set(stories.map((story) => story.id)).size, byLevel: storyLevels, audioEntries: Object.keys(storyAudio).length },
    vocabulary: { cards: ALL_VOCABULARY.length, distinctIds: new Set(ALL_VOCABULARY.map((word) => word.id)).size, distinctHeadwordMeaningPairs: vocabularyPairs.size, byLevel: vocabularyLevels },
    grammar: { releasedLessons: ALL_GRAMMAR_LESSONS.filter((lesson) => lesson.released).length, byLevel: grammarLevels },
    books: books.map((book) => ({ title: book.title, pages: book.pages.length })),
    media: { audioBytes },
  };
  console.log(JSON.stringify(result, null, 2));
} finally {
  await server.close();
}
