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
