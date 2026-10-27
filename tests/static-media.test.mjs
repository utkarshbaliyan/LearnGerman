import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, readdir, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { prepareStaticMedia } from '../scripts/prepare-cloudflare-static-media.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'leselaut-static-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const sourceDir = path.join(root, 'private'), outputDir = path.join(root, 'public/media'), file = path.join(root, 'registry.json');
  await mkdir(path.join(sourceDir, 'stories'), { recursive: true });
  const bytes = Buffer.from('public audio fixture');
  const entry = { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), contentType: 'audio/mp4' };
  await writeFile(path.join(sourceDir, 'stories/test.m4a'), bytes);
  return { root, sourceDir, outputDir, registryFiles: [file], entry, bytes, set: value => writeFile(file, JSON.stringify(value)) };
}
test('static media output includes only checksum-verified allowlisted files', async t => {
  const f = await fixture(t);
  const alignment = Buffer.from('{"words":[]}');
  await writeFile(path.join(f.sourceDir, 'stories/test.json'), alignment);
  await f.set({ 'stories/test.m4a': f.entry, 'stories/test.json': { bytes: alignment.length, sha256: createHash('sha256').update(alignment).digest('hex'), contentType: 'application/json' } });
  await writeFile(path.join(f.sourceDir, 'private-snapshot.json'), 'private fixture');
  assert.deepEqual(await prepareStaticMedia(f), { files: 2, bytes: f.bytes.length + alignment.length });
  assert.deepEqual(await readFile(path.join(f.outputDir, 'stories/test.m4a')), f.bytes);
  assert.deepEqual(await readFile(path.join(f.outputDir, 'stories/test.json')), alignment);
  assert.deepEqual(await readdir(f.outputDir), ['stories']);
});
test('static publication rejects traversal and non-media entries', async t => {
  const f = await fixture(t);
  for (const key of ['../private.env', '/private.env', 'stories/../private.env']) {
    await f.set({ [key]: f.entry }); await assert.rejects(prepareStaticMedia(f), /Invalid public media/);
  }
  await f.set({ 'stories/private.env': { ...f.entry, contentType: 'application/x-env' } });
  await assert.rejects(prepareStaticMedia(f), /Invalid public media/);
});
test('corrupt or oversized media is rejected before publication', async t => {
  const f = await fixture(t); await f.set({ 'stories/test.m4a': { ...f.entry, sha256: '0'.repeat(64) } });
  await assert.rejects(prepareStaticMedia(f), /integrity/);
  await assert.rejects(readdir(f.outputDir), { code: 'ENOENT' });
  await f.set({ 'stories/test.m4a': { ...f.entry, bytes: 26 * 1024 * 1024 } });
  await assert.rejects(prepareStaticMedia(f), /Invalid public media/);
});
test('symlinked media cannot copy a private file into public assets', async t => {
  const f = await fixture(t); await writeFile(path.join(f.root, 'outside.m4a'), f.bytes);
  await symlink(path.join(f.root, 'outside.m4a'), path.join(f.sourceDir, 'stories/link.m4a'));
  await f.set({ 'stories/link.m4a': f.entry });
  await assert.rejects(prepareStaticMedia(f), /Unsafe media source/);
});
