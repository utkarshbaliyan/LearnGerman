// Converts rendered vocabulary voices (youtube-course/production/voices/vocab/out/<file>.wav, made by
// render-vocabulary-voices.command) into public/audio/vocabulary/<file>.mp3 for the word library.
// Safe to re-run while rendering continues: existing mp3s are skipped. Needs ffmpeg.
// Usage: node scripts/build-vocabulary-audio.mjs
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const SRC = 'youtube-course/production/voices/vocab/out', OUT = 'public/audio/vocabulary';
mkdirSync(OUT, { recursive: true });
const wavs = existsSync(SRC) ? readdirSync(SRC).filter(f => f.endsWith('.wav')) : [];
let made = 0;
for (const f of wavs) {
  const out = `${OUT}/${f.replace(/\.wav$/, '.mp3')}`;
  if (existsSync(out) || statSync(`${SRC}/${f}`).size < 2000) continue;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${SRC}/${f}`, '-af',
    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.12,loudnorm=I=-18:TP=-2',
    '-ac', '1', '-ar', '24000', '-b:a', '32k', out]);
  made++;
}
console.log(`${wavs.length} rendered, ${made} new mp3 -> ${OUT} (${readdirSync(OUT).length} total)`);
