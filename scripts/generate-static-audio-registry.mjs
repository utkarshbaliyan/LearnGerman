import { readdir, readFile, lstat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const types = { '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.mp4': 'audio/mp4', '.webm': 'audio/webm', '.ogg': 'audio/ogg', '.opus': 'audio/ogg', '.wav': 'audio/wav', '.json': 'application/json' };
export async function staticAudioRegistry(root) {
  const entries = {};
  async function walk(directory, relative = '') {
    for (const name of (await readdir(directory)).sort()) {
      const file = path.join(directory, name), key = relative + name, stat = await lstat(file);
      if (stat.isSymbolicLink()) throw new Error('Public audio must not contain symlinks.');
      if (stat.isDirectory()) { await walk(file, key + '/'); continue; }
      const contentType = types[path.extname(name).toLowerCase()];
      if (!contentType) continue;
      if (!stat.isFile() || stat.size <= 0 || stat.size > 25 * 1024 * 1024) throw new Error('Invalid public audio asset.');
      const bytes = await readFile(file);
      entries['/audio/' + key] = { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex'), contentType };
    }
  }
  await walk(root);
  return entries;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const entries = await staticAudioRegistry(path.resolve('public/audio'));
  await writeFile('deploy/cloudflare/legacy-audio-registry.json', JSON.stringify(entries, null, 2) + '\n');
  console.log(`Registered ${Object.keys(entries).length} public audio assets.`);
}
