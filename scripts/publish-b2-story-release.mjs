import {readFileSync, writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {storyDigest} from './lib/b2-story-quality.mjs';

const read = path => JSON.parse(readFileSync(path, 'utf8'));
const stage = '.local-piper/b2-release';
const stories = read(`${stage}/stories.json`), translations = read(`${stage}/translations.json`);
const registry = read('content/reading/b2/media-registry.json'), audio = read('content/reading/b2/audio-manifest.json');
const receipt = read('content/reading/b2/media-verification.json');
assert.equal(stories.length, 200);
assert.equal(Object.keys(registry).length, 400);
assert.equal(receipt.stage, 'all-objects-verified');
assert.equal(receipt.origin, 'https://leselaut-german.professor-ut7.chatgpt.site');
assert.deepEqual(Object.keys(receipt.objects).sort(), Object.keys(registry).sort());
for (const [key, entry] of Object.entries(registry)) assert.deepEqual(receipt.objects[key], {bytes:entry.bytes, sha256:entry.sha256});
const meanings = {};
const contextualGlosses = read('content/reading/b2/contextual-glosses.json');
const sharedGlossCorrections = read('content/reading/b2/shared-gloss-corrections.json');
assert.ok(Object.keys(contextualGlosses).every(id => stories.some(story => story.id === id)));
for (const [form, meaning] of Object.entries(sharedGlossCorrections)) assert.ok(/^[\p{Ll}\p{N}]+$/u.test(form) && typeof meaning === 'string' && meaning.trim());
for (let group = 1; group <= 3; group++) {
  const rows = readFileSync(`content/reading/b2/glosses-${group}.psv`, 'utf8').trim().split('\n');
  for (const row of rows) {
    const fields = row.split('|');
    assert.equal(fields.length, 2, row);
    const [key, meaning] = fields;
    assert.match(key, /^[\p{Ll}\p{N}]+$/u);
    assert.ok(meaning.trim() && !Object.hasOwn(meanings, key), 'Duplicate or empty meaning: '+key);
    meanings[key] = meaning.trim();
  }
}
const vite = await createServer({configFile:false, resolve:{alias:{'@':process.cwd()}}, optimizeDeps:{noDiscovery:true, include:[]}, server:{middlewareMode:true, ws:false}});
try {
  const {glossesForText} = await vite.ssrLoadModule('/app/lib/reading-glossary.ts');
  const {cleanWord} = await vite.ssrLoadModule('/app/curriculum/index.ts');
  for (const story of stories) {
    const manuscript = read(`content/reading/b2/manuscripts/${story.id}.json`);
    assert.equal(story.text, manuscript.text, `${story.id}: staged source changed`);
    assert.equal(story.english, manuscript.english);
    assert.equal(audio[story.id]?.textHash, storyDigest(story.text), `${story.id}: missing or stale narration`);
    assert.ok(audio[story.id].src.startsWith('/media/stories/b2/'));
    const overrides = contextualGlosses[story.id] ?? {};
    const forms = new Set((story.text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []).map(cleanWord));
    for (const [form, meaning] of Object.entries(overrides)) assert.ok(forms.has(form) && typeof meaning === 'string' && meaning.trim(), `${story.id}: invalid contextual meaning for ${form}`);
    const help = glossesForText(story.text, {...meanings, ...story.wordGlosses, ...sharedGlossCorrections, ...overrides});
    for (const token of story.text.match(/[\p{L}]+(?:[-’'][\p{L}]+)*/gu) ?? []) {
      assert.ok(help[cleanWord(token)], `${story.id}: missing hover meaning for ${token}`);
    }
    story.wordGlosses = help;
  }
} finally {await vite.close();}
writeFileSync('app/lib/reading-b2-data.json', JSON.stringify(stories,null,2)+'\n');
writeFileSync('app/lib/b2-sentence-translations.json', JSON.stringify(translations,null,2)+'\n');
const sections = read('content/reading/b2/blueprints.json').categories.map(category => category.title);
const goals = [
  'Weigh shared space, privacy, budgets and access needs.',
  'Follow how obligations and boundaries shape relationships.',
  'Trace teamwork, responsibilities, feedback and competing deadlines.',
  'Evaluate workplace fairness, ethical choices and personal limits.',
  'Follow travel disruptions, booking decisions and access constraints.',
  'Interpret expectations and viewpoints in unfamiliar encounters.',
  'Understand participation, assessment and trust at school.',
  'Compare educational choices, criteria and evidence.',
  'Follow differing training goals and shared-space decisions.',
  'Understand fairness, club decisions and outdoor challenges.',
  'Compare product needs, advertising, quality and costs.',
  'Read accounts of contracts, charges and everyday administration.',
  'Follow requests, service decisions and hospitality expectations.',
  'Trace choices and misunderstandings around food and shared meals.',
  'Follow negotiations about traditions, celebrations and inclusion.',
  'Compare civic priorities, representation and practical consequences.',
  'Interpret evidence and competing needs in environmental decisions.',
  'Understand consent, reliability and accessibility in communication.',
  'Follow creative choices, ownership and audience expectations.',
  'Interpret trust, uncertainty and the consequences of personal choices.',
];
assert.equal(sections.length,20);assert.equal(goals.length,sections.length);
writeFileSync('app/lib/reading-b2-sections.json',JSON.stringify({titles:sections,goals},null,2)+'\n');
console.log('Published data prepared: 200 B2 stories, full English, word meanings and 400 byte-verified media objects.');
