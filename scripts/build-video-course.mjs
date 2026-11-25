// Builds app/video-course/data/a1-episodes.json from youtube-course/A1 (which stays out of git).
// Usage: node scripts/build-video-course.mjs
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'youtube-course/A1';
const OUT = 'app/video-course/data/a1-episodes.json';

function parseCsv(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; }
    else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell.replace(/\r$/, '')); rows.push(row); row = []; cell = ''; }
    else cell += c;
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter(r => r.some(Boolean));
  return body.map(r => Object.fromEntries(head.map((h, i) => [h.trim(), (r[i] ?? '').trim()])));
}

// Deterministic shuffle so server and client render identical exercises.
function seeded(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32); }
function shuffle(list, rand) { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function section(md, heading) {
  const m = md.match(new RegExp(`## ${heading}[^\\n]*\\n([\\s\\S]*?)(?=\\n## |$)`));
  return m ? m[1].split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2).trim()) : [];
}
const clean = s => s.replace(/\*/g, '').trim();

const list = parseCsv(readFileSync(join(ROOT, 'A1_episode_list.csv'), 'utf8'));
const episodes = list.filter(row => /^E\d/.test(row.folder)).map(row => {
  const n = Number(row.episode), dir = join(ROOT, row.folder), rand = seeded(n * 7919);
  const topic = readFileSync(join(dir, '00_topic.md'), 'utf8');
  const grammar = readFileSync(join(dir, '02_grammar.md'), 'utf8');
  const vocab = parseCsv(readFileSync(join(dir, '01_vocabulary.csv'), 'utf8'))
    .filter(v => v.german && v.english && v.section !== 'section')
    .map(v => ({ section: v.section, de: v.german, plural: v.plural, en: v.english }));
  const goal = (topic.match(/\| Goal \| (.+?) \|/) || [])[1] ?? '';
  const mistake = section(grammar, 'Typical mistake')[0] ?? '';
  const [wrong, right] = mistake.split('→').map(s => s?.trim());
  const examples = section(grammar, 'Example sentences').map(l => { const [de, en] = l.split(' – '); return { de: clean(de), en: clean(en ?? '') }; });

  // Generated vocab exercises: articles + meaning match.
  const nouns = vocab.filter(v => /^(der|die|das) [A-ZÄÖÜ]/.test(v.de));
  const articles = shuffle(nouns, rand).slice(0, 10).map(v => ({ word: v.de.replace(/^(der|die|das) /, ''), answer: v.de.split(' ')[0], en: v.en }));
  const pool = vocab.filter(v => v.section === 'core' || v.section === 'topic');
  const meanings = shuffle(pool, rand).slice(0, 8).map(v => {
    const others = shuffle(pool.filter(o => o.en !== v.en), rand).slice(0, 3).map(o => o.en);
    return { de: v.de, options: shuffle([v.en, ...others], rand), answer: v.en };
  });

  const chaptersFile = existsSync(join(dir, 'video')) ? readdirSync(join(dir, 'video')).find(f => /_chapters\.txt$/.test(f)) : null;
  const chapters = chaptersFile ? readFileSync(join(dir, 'video', chaptersFile), 'utf8').split('\n').map(l => l.match(/^(\d+:\d\d)\s+(.+)$/)).filter(Boolean).map(m => ({ t: m[1], title: m[2].trim() })) : [];

  return {
    n, slug: `episode-${n}`, title: row.title, english: row.english, location: row.location,
    chapter: row.netzwerk_neu, goal, grammarTitle: row.grammar,
    board: section(grammar, 'Board'), mistake: wrong && right ? { wrong, right } : null, examples,
    vocab, chapters, exercises: { articles, meanings },
  };
});

const mocks = readdirSync(ROOT).filter(d => /^M\d_/.test(d)).sort().map(d => ({ id: d.slice(0, 2).toLowerCase(), afterEpisode: Number(d.match(/E(\d+)/)?.[1] ?? 0) }));
writeFileSync(OUT, JSON.stringify({ level: 'A1', episodes, mocks }, null, 1) + '\n');
console.log(`Wrote ${episodes.length} episodes, ${mocks.length} mock exams -> ${OUT}`);
// Words of episodes with finished practice join the site's vocabulary catalogue (app/vocabulary/data.ts
// keeps only single headwords that are new; phrases are saved as personal words from the course page).
const CATALOG_EPISODES = [1, 2, 3, 4, 5, 6];
const CATEGORY = { 1: 'Grundlagen & Kommunikation', 2: 'Grundlagen & Kommunikation', 3: 'Freizeit, Kultur & Sport', 4: 'Arbeit & Beruf', 5: 'Stadt & Verkehr', 6: 'Stadt & Verkehr' };
const WORD_CATEGORY = { schlecht: 'Adjektive & Adverbien', gut: 'Adjektive & Adverbien', langsam: 'Adjektive & Adverbien', fremd: 'Adjektive & Adverbien', ausländisch: 'Adjektive & Adverbien', international: 'Adjektive & Adverbien', 'die Zahl': 'Zeit, Zahlen & Mengen', 'die Nummer': 'Zeit, Zahlen & Mengen', 'die Telefonnummer': 'Medien & Digitales', 'das Telefon': 'Medien & Digitales', 'die Vorwahl': 'Medien & Digitales', 'die Adresse': 'Zuhause & Wohnen', 'das Bürgeramt': 'Dienstleistungen & Behörden', 'die Anmeldung': 'Dienstleistungen & Behörden', 'die Wartenummer': 'Dienstleistungen & Behörden', 'der Wohnsitz': 'Dienstleistungen & Behörden', 'die Staatsangehörigkeit': 'Dienstleistungen & Behörden', 'der Reisepass': 'Dienstleistungen & Behörden', 'die Hausnummer': 'Zuhause & Wohnen', 'die Etage': 'Zuhause & Wohnen', 'oft': 'Adjektive & Adverbien', 'immer': 'Adjektive & Adverbien', 'nie': 'Adjektive & Adverbien', 'manchmal': 'Adjektive & Adverbien', 'lieber': 'Adjektive & Adverbien', 'lustig': 'Adjektive & Adverbien', 'gern(e)': 'Adjektive & Adverbien', 'so': 'Adjektive & Adverbien', 'nicht': 'Adjektive & Adverbien', 'das Wochenende': 'Zeit, Zahlen & Mengen', 'Montag … Sonntag': 'Zeit, Zahlen & Mengen', 'der Freund': 'Familie & Menschen', 'kennen': 'Verben', 'kennenlernen': 'Verben', 'finden': 'Verben', 'machen': 'Verben', 'lachen': 'Verben', 'der Park': 'Natur, Wetter & Umwelt', 'die Wiese': 'Natur, Wetter & Umwelt', 'arbeiten': 'Verben', 'studieren': 'Schule & Lernen', 'das Studium': 'Schule & Lernen', 'der Student': 'Schule & Lernen', 'der Lehrer': 'Schule & Lernen', 'der Schüler': 'Schule & Lernen', 'die Schule': 'Schule & Lernen', 'der Arzt': 'Gesundheit & Körper', 'das Krankenhaus': 'Gesundheit & Körper', 'haben': 'Verben', 'alt': 'Adjektive & Adverbien', 'jung': 'Adjektive & Adverbien', 'arbeitslos': 'Adjektive & Adverbien', 'selbstständig': 'Adjektive & Adverbien', 'geboren': 'Adjektive & Adverbien', 'männlich': 'Adjektive & Adverbien', 'weiblich': 'Adjektive & Adverbien', 'das Alter': 'Zeit, Zahlen & Mengen', 'das Geburtsjahr': 'Zeit, Zahlen & Mengen', 'das Geburtsdatum': 'Zeit, Zahlen & Mengen', 'das Formular': 'Dienstleistungen & Behörden', 'ausfüllen': 'Verben', 'ankreuzen': 'Verben', 'der Geburtsort': 'Dienstleistungen & Behörden', 'der Familienstand': 'Dienstleistungen & Behörden', 'die Postleitzahl': 'Dienstleistungen & Behörden', 'der Ort': 'Stadt & Verkehr', 'der, die, das': 'Grundlagen & Kommunikation', 'das Hotel': 'Reisen & Unterkunft', 'das Haus': 'Zuhause & Wohnen', 'der See': 'Natur, Wetter & Umwelt', 'das Meer': 'Natur, Wetter & Umwelt', 'der Baum': 'Natur, Wetter & Umwelt', 'die Blume': 'Natur, Wetter & Umwelt', 'der Fluss': 'Natur, Wetter & Umwelt', 'das Wetter': 'Natur, Wetter & Umwelt', 'die Sonne': 'Natur, Wetter & Umwelt', 'scheinen': 'Verben', 'regnen': 'Verben', 'schneien': 'Verben', 'der Regen': 'Natur, Wetter & Umwelt', 'der Wind': 'Natur, Wetter & Umwelt', 'Grad (Celsius)': 'Natur, Wetter & Umwelt', 'bewölkt': 'Natur, Wetter & Umwelt', 'groß': 'Adjektive & Adverbien', 'klein': 'Adjektive & Adverbien', 'schön': 'Adjektive & Adverbien', 'neu': 'Adjektive & Adverbien', 'hoch': 'Adjektive & Adverbien', 'lang': 'Adjektive & Adverbien', 'kurz': 'Adjektive & Adverbien', 'bekannt': 'Adjektive & Adverbien', 'draußen': 'Adjektive & Adverbien', 'kein': 'Grundlagen & Kommunikation', 'das Geschäft': 'Einkaufen & Kleidung', 'der Supermarkt': 'Einkaufen & Kleidung', 'der Markt': 'Einkaufen & Kleidung', 'die Post': 'Dienstleistungen & Behörden', 'die Bank': 'Dienstleistungen & Behörden', 'die Touristeninformation': 'Reisen & Unterkunft', 'der Stadtplan': 'Reisen & Unterkunft', 'die Bibliothek': 'Schule & Lernen', 'das Stadion': 'Freizeit, Kultur & Sport', 'fahren': 'Verben', 'gehen': 'Verben', 'nehmen': 'Verben', 'einsteigen': 'Verben', 'aussteigen': 'Verben', 'entwerten': 'Verben', 'links': 'Adjektive & Adverbien', 'rechts': 'Adjektive & Adverbien', 'geradeaus': 'Adjektive & Adverbien', 'weit': 'Adjektive & Adverbien', 'nah': 'Adjektive & Adverbien', 'hier': 'Adjektive & Adverbien', 'dort': 'Adjektive & Adverbien', 'da': 'Adjektive & Adverbien', 'schnell': 'Adjektive & Adverbien', 'weiter': 'Adjektive & Adverbien', 'gegenüber': 'Adjektive & Adverbien', 'durch': 'Grundlagen & Kommunikation', 'über': 'Grundlagen & Kommunikation', 'nach': 'Grundlagen & Kommunikation' };
const courseWords = episodes.filter(e => CATALOG_EPISODES.includes(e.n)).flatMap(e => e.vocab
  .filter(v => ['core', 'topic', 'sentence', 'website'].includes(v.section))
  .filter(v => !/-$|…/.test(v.de)) // prefixes (Lieblings-) and ranges (Montag … Sonntag) are not headwords
  .map(v => ({ german: v.de, english: v.en, category: WORD_CATEGORY[v.de] ?? CATEGORY[e.n] ?? 'Grundlagen & Kommunikation', episode: e.n })));
writeFileSync('app/vocabulary/video-course-a1.json', JSON.stringify(courseWords, null, 1) + '\n');
console.log(`Wrote ${courseWords.length} course words -> app/vocabulary/video-course-a1.json`);
if (!existsSync('app/video-course/data/youtube-ids.json')) writeFileSync('app/video-course/data/youtube-ids.json', JSON.stringify(Object.fromEntries(episodes.map(e => [e.n, ''])), null, 1) + '\n');
