import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import headers from '../deploy/security-headers.json' with { type: 'json' };

const data = JSON.parse(readFileSync('app/video-course/data/a1-episodes.json', 'utf8'));
const ids = JSON.parse(readFileSync('app/video-course/data/youtube-ids.json', 'utf8'));

test('A1 video course has 24 complete episodes and 3 mock exams', () => {
  assert.equal(data.episodes.length, 24);
  assert.deepEqual(data.mocks.map(m => m.afterEpisode), [8, 16, 24]);
  for (const e of data.episodes) {
    assert.equal(e.slug, `episode-${e.n}`);
    assert.ok(e.title && e.goal && e.grammarTitle, `episode ${e.n} metadata`);
    assert.ok(e.vocab.length >= 20, `episode ${e.n} vocab`);
    for (const a of e.exercises.articles) assert.ok(['der', 'die', 'das'].includes(a.answer));
    for (const m of e.exercises.meanings) assert.ok(m.options.includes(m.answer) && new Set(m.options).size === m.options.length, `episode ${e.n} meaning options`);
  }
});

test('YouTube IDs are empty or valid 11-character IDs', () => {
  for (const [n, id] of Object.entries(ids)) assert.ok(id === '' || /^[\w-]{11}$/.test(id), `episode ${n}: ${id}`);
});

test('CSP allows only the privacy-enhanced YouTube embed and its thumbnails', () => {
  const csp = headers['Content-Security-Policy'];
  assert.match(csp, /frame-src [^;]*https:\/\/www\.youtube-nocookie\.com/);
  assert.match(csp, /img-src [^;]*https:\/\/i\.ytimg\.com/);
  assert.doesNotMatch(csp, /https:\/\/www\.youtube\.com/);
  assert.ok(csp.includes("frame-ancestors 'none'"));
});

test('Episode practice files are internally consistent and every exercise clip has a real recording', () => {
  const audio = JSON.parse(readFileSync('app/video-course/data/audio-map.json', 'utf8'));
  const files = readdirSync('app/video-course/data').filter(f => /^a1-e\d+\.json$/.test(f));
  assert.ok(files.length >= 2);
  for (const file of files) assert.ok(existsSync(`public/video-course/pdf/a1-episode-${Number(file.match(/\d+/)[0])}.pdf`), `${file}: run scripts/build-video-course-pdf.py`);
  for (const file of files) {
  const content = JSON.parse(readFileSync(`app/video-course/data/${file}`, 'utf8'));
  assert.deepEqual(content.blocks.map(b => b.id), ['words', 'grammar', 'skills', 'test']);
  for (const b of content.blocks) for (const s of b.sections) if (s.at) assert.match(s.at, /^\d+:\d\d$/, `${file} ${s.id} at`);
  const strip = s => s.replace(/[.,!?]/g, '').split(' ').sort().join(' ');
  for (const b of content.blocks) for (const s of b.sections) for (const [i, it] of s.items.entries()) {
    const where = `${file} ${b.id}.${s.id}.${i}`;
    if (it.type === 'choice') assert.ok(it.options.includes(it.answer), `${where} answer not in options`);
    if (it.type === 'order') assert.equal(strip(it.tokens.join(' ')), strip(it.answer), `${where} tokens`);
    if (it.type === 'match') {
      assert.ok(it.pairs.length >= 3, `${where} match needs >= 3 pairs`);
      assert.equal(new Set(it.pairs.map(p => p[0])).size, it.pairs.length, `${where} duplicate match keys`);
      assert.equal(new Set(it.pairs.map(p => p[1])).size, it.pairs.length, `${where} duplicate match values`);
    }
    if (it.type === 'sort') {
      const bids = new Set(it.buckets.map(b => b.id));
      assert.ok(it.buckets.length >= 2 && it.cards.length >= 4, `${where} sort buckets/cards`);
      for (const c of it.cards) assert.ok(bids.has(c.bucket), `${where} unknown sort bucket ${c.bucket}`);
    }
    if (it.type === 'chat') {
      assert.ok(it.turns.length >= 2 && it.turns.some(t => t.reply), `${where} chat needs turns with replies`);
      for (const t of it.turns) {
        if (t.audio) assert.ok(audio[`${t.audio.who}|${t.audio.text}`], `${where} chat missing recording: ${t.audio.text}`);
        if (t.reply) assert.ok(t.reply.options.includes(t.reply.answer), `${where} chat reply answer not in options`);
      }
    }
    if (it.at) assert.match(it.at, /^\d+:\d\d$/, where);
    for (const ref of [it.audio, it.model].filter(r => r && typeof r === 'object')) assert.ok(audio[`${ref.who}|${ref.text}`], `${where} missing recording: ${ref.text}`);
    if (it.type === 'write') for (const c of [...it.checks, ...it.warnings]) new RegExp(c.pattern, 'iu');
    if (it.image) assert.ok(existsSync(`public/video-course/img/${it.image}.webp`), `${file} ${where} image`);
  }
  }
});
