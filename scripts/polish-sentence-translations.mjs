import { readFileSync, writeFileSync } from 'node:fs';
const path = process.argv[2] ?? 'app/lib/a2-b1-sentence-translations.json';
const data = JSON.parse(readFileSync(path, 'utf8'));
const edits = JSON.parse(readFileSync('content/reading/sentence-translation-edits.json', 'utf8'));
const used = new Set();
for (const [id, entry] of Object.entries(data)) for (const paragraph of entry.paragraphs) {
  delete paragraph.contextEnglish;
  for (const sentence of paragraph.sentences) {
    if (!sentence.en?.trim()) throw new Error(`${id}: missing English`);
    if (edits[id]?.[sentence.de]) {
      sentence.en = edits[id][sentence.de];
      used.add(`${id}:${sentence.de}`);
    }
    let opening = !(sentence.de.includes('“') && (!sentence.de.includes('„') || sentence.de.indexOf('“') < sentence.de.indexOf('„')));
    sentence.en = sentence.en.replaceAll('"', () => { const quote = opening ? '“' : '”'; opening = !opening; return quote; });
    if (sentence.de.startsWith('„') && !sentence.en.startsWith('“')) sentence.en = `“${sentence.en}`;
    if (sentence.de.endsWith('“') && !/[”"]$/.test(sentence.en)) sentence.en += '”';
  }
}
for (const [id, entries] of Object.entries(edits)) for (const de of Object.keys(entries)) {
  if (!used.has(`${id}:${de}`)) throw new Error(`${id}: stale editorial correction: ${de}`);
}
writeFileSync(path, JSON.stringify(data) + '\n');
console.log(`Applied ${used.size} editorial corrections`);
