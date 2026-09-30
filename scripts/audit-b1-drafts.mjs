import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { b1DraftIssues } from './lib/b1-draft-quality.mjs';

const path = process.argv.includes('--rewrite') ? 'content/reading/b1-rewrite-drafts.json' : 'content/reading/long-stories.json';
const drafts = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
const seeds = [
  ...JSON.parse(readFileSync('app/lib/reading-path-data.json', 'utf8')),
  ...JSON.parse(readFileSync('app/lib/reading-expanded-data.json', 'utf8')),
].filter((story) => story.level === 'B1');
const results = seeds.map((seed) => {
  const draft = drafts[seed.id];
  const issues = draft ? b1DraftIssues(seed.text, draft.text) : [];
  if (process.argv.includes('--rewrite') && draft && draft.sourceHash !== createHash('sha256').update(seed.text).digest('hex'))
    issues.push('source hash does not match current story');
  return { id: seed.id, status: draft ? 'drafted' : 'missing', issues };
});
const report = {
  source: path,
  total: seeds.length,
  drafted: results.filter((item) => item.status === 'drafted').length,
  editoriallyAccepted: seeds.filter((seed) => drafts[seed.id]?.reviewStatus === 'editorially-accepted').length,
  automatedPassed: results.filter((item) => drafts[item.id]?.automatedReview?.pass && !item.issues.length).length,
  machineFlagged: results.filter((item) => item.issues.length).length,
  awaitingDraft: results.filter((item) => item.status === 'missing').length,
  flags: results.filter((item) => item.issues.length),
};
console.log(JSON.stringify(report, null, 2));
