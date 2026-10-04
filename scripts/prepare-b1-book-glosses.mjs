import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'vite';
const directory = 'content/books/zwischen-hoersaal-und-arbeitswelt';
const book = JSON.parse(readFileSync(`${directory}/book.json`, 'utf8'));
assert.equal(book.pages.length, 200);
const overrides = {};
for (const row of readFileSync(`${directory}/gloss-overrides.psv`, 'utf8').trim().split('\n')) {
  const fields = row.split('|'); assert.equal(fields.length, 2, row);
  for (const key of fields[0].split(',')) {
    assert.match(key, /^[a-zäöüßé]+$/u, `Invalid word: ${key}`);
    assert.ok(fields[1].trim()); overrides[key] = fields[1];
  }
}
const a2 = JSON.parse(readFileSync('content/books/nicht-nur-ein-profil/glosses.json', 'utf8'));
const text = book.pages.flatMap(page => page.paragraphs).join(' ');
const vite = await createServer({ configFile: false, resolve: { alias: { '@': process.cwd() } }, server: { middlewareMode: true, ws: false } });
try {
  const { glossesForText } = await vite.ssrLoadModule('/app/lib/reading-glossary.ts');
  const result = glossesForText(text, { ...a2, ...overrides });
  const words = [...new Set((text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []).map(word => word.toLowerCase().replace(/[^a-zäöüßé]/g, '')))];
  const missing = words.filter(word => !result[word]);
  console.log(JSON.stringify({ uniqueWords: words.length, missing }, null, 2));
  assert.equal(missing.length, 0, 'Every book word needs a reviewed meaning');
  assert.equal(new Set(book.pages.flatMap(page => page.paragraphs)).size, 800);
  writeFileSync(`${directory}/glosses.json`, JSON.stringify(Object.fromEntries(Object.entries(result).sort(([a], [b]) => a.localeCompare(b, 'de'))), null, 2) + '\n');
} finally { await vite.close(); }
