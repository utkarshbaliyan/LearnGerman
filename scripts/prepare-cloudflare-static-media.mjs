import { readFile, mkdir, realpath, lstat, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export async function prepareStaticMedia({ registryFiles, sourceDir, outputDir }) {
  const entries = new Map();
  for (const file of registryFiles) {
    for (const [key, entry] of Object.entries(JSON.parse(await readFile(file, 'utf8')))) {
      if (!key || key.startsWith('/') || key.includes('\\') || key.includes('\0')
        || key.split('/').some(part => !part || part === '.' || part === '..')
        || !(/^(audio|image)\//.test(entry?.contentType ?? '') || (entry?.contentType === 'application/json' && key.endsWith('.json')))
        || !Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || entry.bytes > 25 * 1024 * 1024
        || !/^[a-f0-9]{64}$/.test(entry.sha256 ?? '')) throw new Error('Invalid public media entry.');
      const prior = entries.get(key);
      if (prior && (prior.sha256 !== entry.sha256 || prior.bytes !== entry.bytes)) throw new Error('Conflicting media registries.');
      entries.set(key, entry);
    }
  }
  const source = await realpath(sourceDir);
  const batches = async action => {
    const items = [...entries];
    for (let offset = 0; offset < items.length; offset += 16) {
      await Promise.all(items.slice(offset, offset + 16).map(([key, entry]) => action(key, entry)));
    }
  };
  // Validate the complete allowlist before putting any bytes in public output.
  await batches(async (key, entry) => {
    const file = path.join(source, key);
    const resolved = await realpath(file);
    if (!resolved.startsWith(source + path.sep) || !(await lstat(file)).isFile()) throw new Error('Unsafe media source.');
    const bytes = await readFile(file);
    if (bytes.length !== entry.bytes || createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error('Media integrity check failed.');
  });
  await mkdir(outputDir, { recursive: true });
  const output = await realpath(outputDir);
  if (source === output || output.startsWith(source + path.sep) || source.startsWith(output + path.sep)) throw new Error('Media input and output must be separate.');
  let totalBytes = 0;
  await batches(async (key, entry) => {
    const target = path.join(output, key);
    await mkdir(path.dirname(target), { recursive: true });
    const parent = await realpath(path.dirname(target));
    if (parent !== output && !parent.startsWith(output + path.sep)) throw new Error('Unsafe media output.');
    const existing = await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; return null; });
    if (existing && !existing.isFile()) throw new Error('Unsafe media output.');
    await copyFile(path.join(source, key), target);
    totalBytes += entry.bytes;
  });
  return { files: entries.size, bytes: totalBytes };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [sourceDir, outputDir] = process.argv.slice(2);
  if (!sourceDir || !outputDir) throw new Error('Usage: node scripts/prepare-cloudflare-static-media.mjs <verified-media-directory> <static-output/media>');
  const registryFiles = [
    'content/books/zwischen-hoersaal-und-arbeitswelt/media-registry.json',
    'content/reading/b2/media-registry.json',
    'content/illustrations/story-art-registry.json',
    'content/reading/compatible/media-registry.json',
  ];
  console.log(JSON.stringify(await prepareStaticMedia({ registryFiles, sourceDir, outputDir })));
}
