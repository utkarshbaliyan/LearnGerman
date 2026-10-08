import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {basename, join} from 'node:path';
import assert from 'node:assert/strict';
import {storyDigest} from './lib/b2-story-quality.mjs';
import {allowedStoryMedia} from '../app/lib/story-object-media.mjs';

const read = path => {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (cause) { throw new Error(`Invalid or unreadable release JSON: ${path}`, {cause}); }
};
const stage = '.local-piper/b2-release';
const stories = read(`${stage}/stories.json`), plans = read(`${stage}/plans.json`), audio = read(`${stage}/audio-manifest.json`);
assert.equal(stories.length, 200);
assert.deepEqual(Object.keys(audio).sort(), stories.map(s => s.id).sort(), 'Every B2 story needs a verified recording');
const registry = {}, manifest = {}, reports = {};
mkdirSync('content/reading/b2/timings', {recursive:true});
for (const story of stories) {
  const hash = storyDigest(story.text), plan = plans[story.id], entry = audio[story.id];
  assert.equal(plan.textHash, hash);
  assert.equal(plan.segments.map(s => s.text).join(''), story.text);
  const pythonJSON = '[' + plan.segments.map(s => '['+JSON.stringify(s.voice)+', '+JSON.stringify(s.text)+']').join(', ')+']';
  const name = `${story.id}-${hash.slice(0,12)}-${storyDigest(pythonJSON).slice(0,8)}-qwen-dialogue-opus16`;
  assert.equal(basename(entry.src), name+'.webm', `${story.id}: voice plan changed`);
  assert.equal(basename(entry.timingSrc), name+'.json');
  assert.equal(entry.textHash, hash);
  const visible = story.text.split(/\s+/).filter(w => /[A-Za-zÄÖÜäöüßÉé0-9]/.test(w));
  assert.equal(entry.wordCount, visible.length);
  const timing = read(`${stage}/audio/${name}.json`);
  assert.equal(timing.textHash, hash);
  assert.equal(timing.starts.length, visible.length);
  assert.equal(timing.duration, entry.duration);
  assert.ok(Number.isFinite(entry.duration) && entry.duration > visible.length*.18 && entry.duration < visible.length*1.3+4);
  assert.ok(timing.starts.every((n,i) => Number.isFinite(n) && n >= 0 && n < timing.duration && (i === 0 || n > timing.starts[i-1])));
  const report = read(`${stage}/checkpoints/${name}-transcript.json`);
  assert.ok(report.coverage >= .9 && report.excess <= .12, `${story.id}: narration transcript validation failed`);
  const bytes = readFileSync(`${stage}/audio/${name}.webm`);
  assert.equal(bytes.subarray(0,4).toString('hex'), '1a45dfa3');
  assert.ok(bytes.length > 10000);
  const paths = {};
  for (const extension of ['webm','json']) {
    const localFilename = name+'.'+extension, data = readFileSync(join(stage,'audio',localFilename));
    // Hashes pin the exact encoded audio and exact timing bytes independently.
    const sha256 = storyDigest(data), asset = name+'-'+sha256.slice(0,12)+'.'+extension;
    const key = 'stories/b2/'+asset;
    registry[key] = {bytes:data.length, sha256, localFilename, contentType:extension === 'webm' ? 'audio/webm' : 'application/json'};
    assert.ok(allowedStoryMedia(asset, registry));
    paths[extension] = '/media/'+key;
  }
  manifest[story.id] = {...entry, src:paths.webm, timingSrc:paths.json};
  writeFileSync(`content/reading/b2/timings/${story.id}.json`, readFileSync(`${stage}/audio/${name}.json`));
  reports[story.id] = {textHash:hash, planHash:storyDigest(pythonJSON), coverage:report.coverage, excess:report.excess,
    voices:[...new Set(plan.segments.map(s => s.voice))]};
}
for (const [filename, data] of Object.entries({'media-registry.json':registry,'audio-manifest.json':manifest,'audio-validation.json':reports})) {
  writeFileSync(`content/reading/b2/${filename}`,JSON.stringify(data,null,2)+'\n');
}
console.log('All 200 recordings and 400 immutable media objects validated; ready for upload.');
