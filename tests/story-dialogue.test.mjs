import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { quotedSpans, dialogueSegments } from '../scripts/lib/story-dialogue.mjs';

test('speaker segments preserve story text and keep written signs with narration', () => {
  const text = 'An der Tür steht „Café“. „Kommst du?“, fragt Mia. „Ja!“, sagt Sam.';
  const assignments = [
    { index: 0, voice: 'narrator', speaker: 'Narrator' },
    { index: 1, voice: 'female', speaker: 'Mia' },
    { index: 2, voice: 'male', speaker: 'Sam' },
  ];
  const segments = dialogueSegments(text, assignments);
  assert.equal(segments.map(segment => segment.text).join(''), text);
  assert.deepEqual(segments.filter(segment => segment.speaker !== 'Narrator').map(segment => [segment.text, segment.voice]), [['„Kommst du?“', 'female'], ['„Ja!“', 'male']]);
  assert.equal(quotedSpans(text).length, 3);
  assert.throws(() => dialogueSegments(text, assignments.slice(1)), /Every quotation/);
  assert.throws(() => dialogueSegments(text, [{ ...assignments[0], voice: 'unknown' }, ...assignments.slice(1)]), /Invalid speaker/);
});

test('first story assigns Mia the answer to Sam’s question and preserves source identity', () => {
  const story = JSON.parse(readFileSync('app/lib/reading-path-data.json'))[0];
  const plan = JSON.parse(readFileSync('content/reading/dialogue-voices.json'))[story.id];
  assert.equal(plan.textHash, createHash('sha256').update(story.text).digest('hex'));
  assert.deepEqual(plan.segments, dialogueSegments(story.text, plan.assignments));
  assert.equal(plan.assignments[3].speaker, 'Sam');
  assert.equal(plan.assignments[4].speaker, 'Mia');
  assert.equal(plan.assignments[10].voice, 'narrator', 'Deutschkurs is a sign');
  assert.equal(plan.assignments[12].voice, 'female', 'the teacher speaks');
});

test('every story has a speaker plan matching its text without removing any text', () => {
  const stories = ['reading-path-data', 'reading-expanded-data'].flatMap(name => JSON.parse(readFileSync(`app/lib/${name}.json`)));
  const plans = JSON.parse(readFileSync('content/reading/dialogue-voices.json'));
  const byId = new Map(stories.map(story => [story.id, story]));
  assert.deepEqual(Object.keys(plans).sort(), [...byId.keys()].sort());
  for (const [id, plan] of Object.entries(plans)) {
    const story = byId.get(id);
    assert.ok(story, id);
    assert.equal(plan.textHash, createHash('sha256').update(story.text).digest('hex'), id);
    assert.deepEqual(plan.segments, dialogueSegments(story.text, plan.assignments), id);
  }
});

test('an unspecified first-person speaker keeps the narrator voice', () => {
  const plans = JSON.parse(readFileSync('content/reading/dialogue-voices.json'));
  assert.equal(plans['reading-a2-124-v1'].assignments[2].voice, 'narrator');
});

test('every recording belongs to the current character voice plan', () => {
  const plans = JSON.parse(readFileSync('content/reading/dialogue-voices.json'));
  const manifest = JSON.parse(readFileSync('app/lib/reading-audio-manifest.json'));
  for (const [id, plan] of Object.entries(plans)) {
    // Preserve the generator's JSON spacing so both languages hash the same turns.
    const serialized = `[${plan.segments.map(segment => `[${JSON.stringify(segment.voice)}, ${JSON.stringify(segment.text)}]`).join(', ')}]`;
    const planHash = createHash('sha256').update(serialized).digest('hex').slice(0, 8);
    const name = `${id}-${plan.textHash.slice(0, 12)}-${planHash}-qwen-dialogue-opus24`;
    assert.equal(manifest[id].src, `/audio/reading/${name}.webm`, id);
    assert.equal(manifest[id].timingSrc, `/audio/reading/${name}.json`, id);
  }
});
