import assert from 'node:assert/strict';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { QUIZ_REVISION, quizIssues, storyHash, quizHash, publishedQuestions, balanceAnswerPositions } from './lib/story-quiz-quality.mjs';

const source = process.argv.find(arg => arg.startsWith('--source='))?.slice(9) ?? 'content/reading/quizzes/reviewed.json';
const stories = ['reading-path-data', 'reading-expanded-data', 'reading-b2-data'].flatMap(name => JSON.parse(readFileSync(`app/lib/${name}.json`, 'utf8')));
assert.equal(stories.length, 654);
assert.ok(existsSync(source), 'An authored and reviewed question bank is required');
const bank = JSON.parse(readFileSync(source, 'utf8'));
assert.deepEqual(Object.keys(bank).sort(), stories.map(s => s.id).sort(), 'Never publish an incomplete question bank');
const published = {}, reviewed = {};
for (const story of stories) {
  const row = bank[story.id];
  assert.equal(row.revision, QUIZ_REVISION, `${story.id}: obsolete quiz revision`);
  assert.equal(row.level, story.level, `${story.id}: incorrect level`);
  assert.equal(row.sourceHash, storyHash(story.text), `${story.id}: source changed`);
  assert.equal(row.review?.pass, true, `${story.id}: editorial review missing`);
  assert.equal(row.review.peerReview?.pass, true, `${story.id}: independent peer review missing`);
  assert.equal(row.review.peerReview.sourceHash, row.sourceHash, `${story.id}: peer review has an old source`);
  assert.equal(row.review.peerReview.quizHash, quizHash(row.questions), `${story.id}: quiz changed after peer review`);
  assert.deepEqual(quizIssues(story, row.questions), [], `${story.id}: quality checks`);
  const questions = balanceAnswerPositions(story, row.questions);
  reviewed[story.id] = { ...row, questions };
  published[story.id] = publishedQuestions(questions);
}
mkdirSync('content/reading/quizzes', { recursive: true });
writeFileSync('content/reading/quizzes/reviewed.json', JSON.stringify(reviewed, null, 2) + '\n');
writeFileSync('app/lib/reading-quizzes.json', JSON.stringify(published) + '\n');
console.log('Compiled 654 source-bound quizzes: 454 × 4 questions and 200 × 6 questions.');
