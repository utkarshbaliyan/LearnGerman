// Copies the episode's real character voices (youtube-course/production/voices/out, keyed by
// md5("who|lang|text")) into public/video-course/audio/<key>.mp3 and writes data/audio-map.json.
// Lines without a recording are listed in youtube-course/production/voices/needed_web.json
// (same format as needed.json) so they can be rendered with Qwen later; the site falls back
// to the browser's German voice meanwhile.
// Usage: node scripts/build-video-course-audio.mjs
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const VOICES = 'youtube-course/production/voices/out', OUT = 'public/video-course/audio';
const MAP = 'app/video-course/data/audio-map.json';
const key = (who, text) => createHash('md5').update(`${who}|de|${text}`).digest('hex').slice(0, 16);
mkdirSync(OUT, { recursive: true });

// How placeholder entries are read aloud (the key stays the displayed text).
const SPOKEN = { 'Ich heiße … / Ich bin …': 'Ich heiße Anna. Ich bin Anna.', 'Herr / Frau Doktor': 'Herr Doktor. Frau Doktor.', 'null … zwanzig': 'null, eins, zwei, drei, vier, fünf … zwanzig.', 'bisschen': 'ein bisschen', 'Lieblings-': 'Lieblings… der Lieblingsfilm.', 'Montag … Sonntag': 'Montag, Dienstag, Mittwoch, Donnerstag, Freitag, Samstag, Sonntag.', 'die Bank (Parkbank)': 'die Bank. die Parkbank.', 'der, die, das': 'der, die, das.', 'einundzwanzig … hundert': 'einundzwanzig, dreißig, vierzig, fünfzig, sechzig, siebzig, achtzig, neunzig, hundert.', 'Wie alt bist du? – Ich bin 27.': 'Wie alt bist du? Ich bin siebenundzwanzig.', 'ein-': 'ein, eine.', 'Grad (Celsius)': 'Grad Celsius.', 'Frühling · Sommer · Herbst · Winter': 'Frühling, Sommer, Herbst, Winter.', 'Januar … Dezember': 'Januar, Februar, März, April, Mai, Juni, Juli, August, September, Oktober, November, Dezember.', 'Wie ist das Wetter? – Die Sonne scheint.': 'Wie ist das Wetter? Die Sonne scheint.', 'kalt · warm · heiß': 'kalt, warm, heiß.', 'Nehmen Sie die U3.': 'Nehmen Sie die U drei.', 'die erste / zweite Straße': 'die erste Straße. die zweite Straße.' };
const refs = new Map(); // "who|text" -> {who, text}
const add = (who, text) => refs.set(`${who}|${text}`, { who, text });
function walk(node) {
  if (Array.isArray(node)) return node.forEach(walk);
  if (node && typeof node === 'object') {
    if (typeof node.who === 'string' && typeof node.text === 'string' && !('audio' in node) && !('reply' in node) && !('en' in node)) add(node.who, node.text);
    Object.values(node).forEach(walk);
  }
}
const episodes = JSON.parse(readFileSync('app/video-course/data/a1-episodes.json', 'utf8')).episodes;
for (const f of readdirSync('app/video-course/data').filter(f => /^a1-e\d+\.json$/.test(f))) {
  const content = JSON.parse(readFileSync(`app/video-course/data/${f}`, 'utf8'));
  walk(content);
  // Flashcards: Frau Weber reads each vocabulary entry.
  const ep = episodes.find(e => e.n === content.episode);
  for (const v of ep?.vocab ?? []) add('T', v.de); // all sections, incl. bonus words
}

// Try a few spellings the video used (with/without "!", without "(sich)").
const variants = t => {
  const base = [t, t.replace(/^\(sich\) /, 'sich '), t.replace(/\s*\(.*?\)\s*/g, ' ').trim()];
  const out = new Set();
  for (const b of base) for (const c of [b, b[0].toUpperCase() + b.slice(1)]) { const bare = c.replace(/[!.?]$/, ''); out.add(c).add(bare).add(`${bare}!`).add(`${bare}?`); }
  return [...out];
};
const map = existsSync(MAP) ? JSON.parse(readFileSync(MAP, 'utf8')) : {};
const needed = {};
let made = 0, found = 0;
for (const [id, { who, text }] of refs) {
  const hit = variants(text).map(t => key(who, t)).find(k => existsSync(`${VOICES}/${k}.wav`));
  if (!hit) {
    // Queue for Qwen under the display text's key; speak "A / B" as two sentences and skip "…".
    const spoken = SPOKEN[text] ?? text.split(/ \/ | – | · /).map(p => p.replace(/\s*…/g, '').trim()).map(p => /[.!?]$/.test(p) ? p : `${p}.`).join(' ');
    needed[key(who, text)] = { who, lang: 'de', text: spoken, display: text };
    delete map[id]; continue;
  }
  found++; map[id] = hit;
  const out = `${OUT}/${hit}.mp3`;
  if (existsSync(out)) continue;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${VOICES}/${hit}.wav`, '-af',
    'silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur=0.15,loudnorm=I=-18:TP=-2',
    '-ac', '1', '-ar', '24000', '-b:a', '40k', out]);
  made++;
}
writeFileSync(MAP, JSON.stringify(Object.fromEntries(Object.entries(map).sort()), null, 1) + '\n');
writeFileSync('youtube-course/production/voices/needed_web.json', JSON.stringify(needed, null, 1) + '\n');
console.log(`${refs.size} lines: ${found} with voice (${made} new mp3), ${Object.keys(needed).length} missing -> needed_web.json`);
