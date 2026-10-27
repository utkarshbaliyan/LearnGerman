import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { staticAudioRegistry } from '../scripts/generate-static-audio-registry.mjs';

test('legacy static audio metadata matches every public asset, including byte length and hash', async () => {
  const expected = JSON.parse(await readFile('deploy/cloudflare/legacy-audio-registry.json', 'utf8'));
  assert.deepEqual(await staticAudioRegistry(path.resolve('public/audio')), expected,
    'After changing public audio, run node scripts/generate-static-audio-registry.mjs and commit its output.');
});
