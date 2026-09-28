import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { narrationSources } from '../scripts/lib/narration-sources.mjs';
import { dialogueSegments } from '../scripts/lib/story-dialogue.mjs';

const json = path => JSON.parse(readFileSync(path, 'utf8'));

test('book narration uses the exact four paragraphs on every page', () => {
  const book = json('app/lib/book-data.json');
  const pages = narrationSources('book');
  assert.equal(pages.length, 200);
  for (const [index, page] of pages.entries()) {
    assert.equal(page.id, String(book.pages[index].number));
    assert.equal(page.text, book.pages[index].paragraphs.join('\n\n'));
  }
  assert.throws(() => narrationSources('unknown'), /Unknown narration collection/);
});

test('the book keeps signs with narration and gives spoken dialogue its character voice', () => {
  const plans = json('content/books/dialogue-voices.json');
  assert.equal(plans['1'].assignments[1].voice, 'narrator');
  assert.deepEqual(plans['2'].assignments.map(a => a.voice), ['male', 'female', 'female']);
  assert.equal(plans['5'].assignments[0].voice, 'narrator');
  assert.equal(plans['5'].assignments[2].voice, 'male');
  assert.deepEqual(plans['8'].assignments.map(a => a.voice), ['male', 'female', 'male', 'narrator', 'male', 'male']);
  assert.equal(plans['17'].assignments[1].voice, 'male', 'Jonas keeps his voice in a clearly attributed message');
  assert.equal(plans['17'].assignments[2].voice, 'narrator', 'Garten 17 is written on paper');
});

test('every book page has one recording matching its exact text and character plan', () => {
  const book = json('app/lib/book-data.json');
  const plans = json('content/books/dialogue-voices.json');
  const manifest = json('app/lib/book-audio-manifest.json');
  assert.equal(Object.keys(plans).length, 200);
  assert.equal(Object.keys(manifest).length, 200);
  for (const page of narrationSources('book')) {
    const plan = plans[page.id];
    const digest = createHash('sha256').update(page.text).digest('hex');
    assert.equal(plan.textHash, digest);
    assert.deepEqual(plan.segments, dialogueSegments(page.text, plan.assignments));
    const serialized = `[${plan.segments.map(s => `[${JSON.stringify(s.voice)}, ${JSON.stringify(s.text)}]`).join(', ')}]`;
    const planHash = createHash('sha256').update(serialized).digest('hex').slice(0, 8);
    const name = `p${page.id.padStart(3, '0')}-page-${digest.slice(0, 12)}-${planHash}-qwen-dialogue-opus24`;
    assert.equal(manifest[page.id].src, `/audio/books/${book.id}/${name}.webm`);
    assert.equal(manifest[page.id].timingSrc, `/audio/books/${book.id}/${name}.json`);
  }
});
