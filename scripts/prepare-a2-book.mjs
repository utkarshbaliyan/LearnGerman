import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';

const directory = 'content/books/nicht-nur-ein-profil';
const chapters = ['Ein Platz für zwei', 'Nachrichten auf dem Handy', 'Eine Pause', 'Der Kochkurs', 'Mehr als ein Abend', 'Zeit für uns', 'Ein schwieriges Gespräch', 'Sechs Wochen', 'Wieder zu Hause', 'Unser Alltag'];
const cast = { Ben: 'male', Lea: 'female', Nora: 'female', Pavel: 'male', Jana: 'female', Sofia: 'female', Martin: 'male', Eva: 'female' };
const rows = readFileSync(`${directory}/manuscript.psv`, 'utf8').trim().split('\n');
const pages = [], translations = {}, plans = {}, sources = [];
for (const [index, row] of rows.entries()) {
  const fields = row.split('|');
  assert.equal(fields.length, 11, `Page ${index + 1}: manuscript fields`);
  const [raw, title, ...body] = fields;
  const number = Number(raw), paragraphs = [body[0], body[2], body[4], body[6]];
  assert.equal(number, index + 1);
  assert.ok(title.trim() && paragraphs.every(p => p.trim()));
  const text = paragraphs.join('\n\n'), hash = createHash('sha256').update(text).digest('hex');
  const count = text.split(/\s+/).length;
  assert.ok(count >= 65 && count <= 140, `Page ${number}: ${count} words`);
  const chapter = Math.floor(index / 20) + 1;
  pages.push({ number, title, chapter, chapterTitle: chapters[chapter - 1], chapterPage: index % 20 + 1, paragraphs });
  translations[number] = paragraphs.map((source, i) => ({ source, en: body[i * 2 + 1] }));
  assert.ok(translations[number].every(p => p.en.trim()));
  const quotes = [...text.matchAll(/„[^“]+“/gu)], voices = body[8] ? body[8].split(',') : [];
  assert.equal(quotes.length, voices.length, `Page ${number}: quote voices`);
  const assignments = [], segments = []; let cursor = 0;
  for (const [q, quote] of quotes.entries()) {
    const prefix = text.slice(0, quote.index);
    const speaker = prefix.match(/(Ben|Lea|Nora|Pavel|Jana|Sofia|Martin|Eva) (?:sagt|fragt|antwortet|schreibt):\s*$/)?.[1]
      ?? prefix.match(/(?:sagt|fragt|antwortet|schreibt) (Ben|Lea|Nora|Pavel|Jana|Sofia|Martin|Eva):\s*$/)?.[1];
    assert.ok(speaker && cast[speaker] === voices[q], `Page ${number}: attributed quote ${q}`);
    if (quote.index > cursor) segments.push({ text: text.slice(cursor, quote.index), voice: 'female', speaker: 'Narrator' });
    segments.push({ text: quote[0], voice: voices[q], speaker });
    assignments.push({ index: q, speaker, voice: voices[q], evidence: `${speaker} introduces the exact quote on page ${number}: ${quote[0]}` });
    cursor = quote.index + quote[0].length;
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), voice: 'female', speaker: 'Narrator' });
  assert.equal(segments.map(s => s.text).join(''), text);
  plans[number] = { textHash: hash, assignments, segments };
  sources.push({ id: String(number), title, text, level: 'A2', hotwords: Object.keys(cast).concat('Lindenstadt'), paragraphSentences: paragraphs.map(readingSentences) });
}
assert.ok(pages.length <= 200);
if (process.argv.includes('--complete')) assert.equal(pages.length, 200);
function write(path, value) { const temporary = `${path}.tmp`; writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n'); renameSync(temporary, path); }
mkdirSync('.local-piper/a2-book', { recursive: true });
write(`${directory}/book.json`, { id: 'nicht-nur-ein-profil', title: 'Nicht nur ein Profil', subtitle: 'Eine Geschichte über Nähe, Zeit und Liebe – Niveau A2', level: 'A2', pages });
write(`${directory}/translations.json`, translations);
write(`${directory}/dialogue-voices.json`, plans);
write('.local-piper/a2-book/sources.json', sources);
console.log(`Prepared ${pages.length} source-matched pages, translations and attributed voice plans. Publication remains blocked until all 200 pages and recordings validate.`);
