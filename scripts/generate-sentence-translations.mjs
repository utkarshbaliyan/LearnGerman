import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { chooseSentenceTranslations } from './lib/select-sentence-translations.mjs';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';

// Offline contextual generation; models and Python dependencies stay outside the site.
// TRANSLATION_PYTHON=<python> TRANSLATION_MODEL_PATH=<local-Marian-model> node scripts/generate-sentence-translations.mjs
const stories = ['reading-path-data', 'reading-expanded-data'].flatMap(name =>
  JSON.parse(readFileSync(`app/lib/${name}.json`, 'utf8'))).filter(story => story.level !== 'A1');
const source = Object.fromEntries(stories.map(story => [story.id, { paragraphs:
  story.text.split('\n\n').map(source => ({ source, sentences:
    readingSentences(source).map(de => ({ de })) })) }]));
const directory = mkdtempSync(join(tmpdir(), 'leselaut-translations-'));
const input = join(directory, 'source.json');
const output = process.env.TRANSLATION_OUTPUT ?? 'app/lib/a2-b1-sentence-translations.json';
const run = (mode, destination = output) => {
  const result = spawnSync(process.env.TRANSLATION_PYTHON ?? 'python3',
    ['scripts/translate-sentences-offline.py', input, destination, mode], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
};
writeFileSync(input, JSON.stringify(source));
run('paragraphs');
const translated = JSON.parse(readFileSync(output, 'utf8'));
if (Object.values(translated).some(entry => entry.paragraphs.some(p => p.contextEnglish))) {
  const baselinePath = join(directory, 'baseline.json');
  run('sentences', baselinePath);
  const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
  for (const [id, entry] of Object.entries(translated)) for (const [i, paragraph] of entry.paragraphs.entries()) {
    const reference = baseline[id].paragraphs[i].sentences.map(s => s.en);
    const lines = chooseSentenceTranslations(paragraph.contextEnglish, reference);
    paragraph.sentences.forEach((sentence, j) => { sentence.en = lines[j]; });
    delete paragraph.contextEnglish;
  }
  writeFileSync(output, JSON.stringify(translated) + '\n');
}
const polish = spawnSync(process.execPath, ['scripts/polish-sentence-translations.mjs', output], { stdio: 'inherit' });
process.exit(polish.status ?? 1);
