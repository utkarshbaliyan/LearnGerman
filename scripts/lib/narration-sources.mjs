import { readFileSync } from 'node:fs';

export function narrationSources(collection = 'stories') {
  if (collection === 'stories') return ['reading-path-data', 'reading-expanded-data'].flatMap(name => JSON.parse(readFileSync(`app/lib/${name}.json`, 'utf8')));
  if (collection !== 'book') throw new Error(`Unknown narration collection: ${collection}`);
  const book = JSON.parse(readFileSync('app/lib/book-data.json', 'utf8'));
  return book.pages.map((page, index) => ({
    id: String(page.number), title: page.title, text: page.paragraphs.join('\n\n'),
    hotwords: ['Mila', 'Sara', 'Jonas', 'Lindenstadt', 'Morgenbrot', 'Radpunkt', 'Sonnenhof', 'König', 'Weber', 'Berg', 'Albers'],
    context: {
      book: book.title,
      castEvidence: [
        { page: 1, text: book.pages[0].paragraphs.slice(0, 2).join(' ') },
        { page: 5, text: book.pages[4].paragraphs[1] },
        { page: 8, text: book.pages[7].paragraphs[0] },
      ],
      previousPage: book.pages[index - 1]?.paragraphs.join('\n\n'),
      nextPage: book.pages[index + 1]?.paragraphs.join('\n\n'),
    },
  }));
}
