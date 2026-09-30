import assert from 'node:assert/strict';
import test from 'node:test';
import { b1DraftIssues } from '../scripts/lib/b1-draft-quality.mjs';

test('B1 draft checks catch a changed narrator and grammar commentary even with quoted first person', () => {
  const seed = 'Mira sah die Nebenkosten. Sie nahm die Unterlagen mit.';
  const draft = 'Ich sah die Nebenkosten. „Ich frage später“, sagte Mira. In diesem Text wird die passive Form erklärt.\n\nMira ging nach Hause.';
  const issues = b1DraftIssues(seed, draft);
  assert.ok(issues.includes('third-person seed changes to first-person narration'));
  assert.ok(issues.includes('grammar explanation or reader-facing meta-text inside story'));
});

test('first-person dialogue alone does not change a third-person narrator', () => {
  const seed = 'Mira sah die Nebenkosten. Sie nahm die Unterlagen mit.';
  const draft = 'Mira sah die Nebenkosten. „Ich frage später“, sagte sie.\n\nSie nahm die Unterlagen mit.';
  assert.ok(!b1DraftIssues(seed, draft).some((issue) => issue.includes('first-person')));
});

test('B1 checks reject invented weekdays that can break the original chronology', () => {
  const seed = 'Mia schreibt dem Hostel. Am Nachmittag kommt die Antwort.';
  const draft = 'Am Freitagabend schreibt Mia dem Hostel. Am Nachmittag kommt die Antwort.';
  assert.ok(b1DraftIssues(seed, draft).some((issue) => issue.includes('invented weekday: Freitagabend')));
});

test('B1 checks allow a weekday already present in another grammatical form', () => {
  const seed = 'An Donnerstagen kommen viele Anfragen.';
  const draft = 'Am Donnerstag kommen viele Anfragen.';
  assert.ok(!b1DraftIssues(seed, draft).some((issue) => issue.includes('invented weekday')));
});

test('third-person meinen does not imply first-person narration', () => {
  const seed = 'Lea und ihr Bruder meinen unterschiedliche Dinge.';
  const draft = 'Lea und ihr Bruder sprechen über ihre verschiedenen Wünsche.';
  assert.ok(!b1DraftIssues(seed, draft).some((issue) => issue.includes('first-person')));
});

test('a reader of an in-story blog is not reader-facing meta-text', () => {
  const seed = 'Ein Leser kommentiert den Beitrag.';
  const draft = 'Mia fragt, was der Leser mit seiner Nachricht meint.';
  assert.ok(!b1DraftIssues(seed, draft).some((issue) => issue.includes('meta-text')));
});
