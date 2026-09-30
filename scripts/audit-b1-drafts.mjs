import { readFileSync } from 'node:fs';
import { b1DraftIssues } from './lib/b1-draft-quality.mjs';

const drafts = JSON.parse(readFileSync('content/reading/long-stories.json', 'utf8'));
const seeds = [
  ...JSON.parse(readFileSync('app/lib/reading-path-data.json', 'utf8')),
  ...JSON.parse(readFileSync('app/lib/reading-expanded-data.json', 'utf8')),
].filter((story) => story.level === 'B1');
const results = seeds.map((seed) => ({ id: seed.id, status: drafts[seed.id] ? 'drafted' : 'missing', issues: drafts[seed.id] ? b1DraftIssues(seed.text, drafts[seed.id].text) : [] }));
const report = {
  total: seeds.length,
  drafted: results.filter((item) => item.status === 'drafted').length,
  editoriallyAccepted: seeds.filter((seed) => drafts[seed.id]?.reviewStatus === 'editorially-accepted').length,
  machineFlagged: results.filter((item) => item.issues.length).length,
  awaitingDraft: results.filter((item) => item.status === 'missing').length,
  flags: results.filter((item) => item.issues.length),
};
console.log(JSON.stringify(report, null, 2));
