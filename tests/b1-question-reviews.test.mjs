import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { readingSentences } from '../app/lib/reading-sentence-segmentation.mjs';

const root = new URL('../', import.meta.url);
const read = path => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const drafts = read('content/reading/b1-rewrite-drafts.json');
const reviews = read('content/reading/b1-reviews/question-reviews.json');

test('all 400 B1 comprehension answers have evidence in the current rewritten source', () => {
  assert.deepEqual(Object.keys(reviews).sort(), Object.keys(drafts).map(id => id.replace(/-v1$/, '-v2')).sort());
  for (const [id, review] of Object.entries(reviews)) {
    const text = drafts[id.replace(/-v2$/, '-v1')].text;
    assert.equal(review.sourceHash, createHash('sha256').update(text).digest('hex'), id);
    assert.equal(review.questions.length, 2, id);
    assert.notEqual(review.questions[0].prompt, review.questions[1].prompt, id);
    const sentences = new Set(text.split('\n\n').flatMap(readingSentences));
    for (const question of review.questions) {
      assert.equal(new Set(question.options).size, 3, id);
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < 3, id);
      assert.ok(question.explanation.length > 15, id);
      assert.ok(question.evidence.length > 0, id);
      for (const sentence of question.evidence) assert.ok(sentences.has(sentence), `${id}: stale question evidence`);
    }
  }
});

test('question explanations distinguish applause and prepublication photo permission', () => {
  assert.match(reviews['reading-b1-16-v2'].questions[1].explanation, /front row.*applauds/i);
  assert.doesNotMatch(reviews['reading-b1-16-v2'].questions[1].explanation, /stays awake/i);
  const photo = reviews['reading-b1-170-v2'].questions[1];
  assert.match(photo.options[photo.answer], /from the selection/i);
  assert.match(photo.explanation, /before publication/i);
});
