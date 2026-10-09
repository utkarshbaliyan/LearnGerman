import { readFileSync, writeFileSync } from 'node:fs';
import { assignStoryArtCovers } from '../app/lib/story-art-covers.mjs';
import { allowedStoryArt } from '../app/lib/story-art-media.mjs';

const read = name => JSON.parse(readFileSync(`content/illustrations/${name}.json`, 'utf8'));
const briefs = read('story-art-briefs'), registry = read('story-art-registry');
const originals = {};
for (const [key, entry] of Object.entries(registry)) {
  if (!allowedStoryArt(key.split('/').at(-1), registry)) throw new Error(`Invalid story image: ${key}`);
  originals[entry.storyId] = { url: `/media/${key}` };
}
const covers = assignStoryArtCovers(briefs, originals, read('story-art-reuse'));
writeFileSync('content/illustrations/story-art-manifest.json', JSON.stringify(covers, null, 2) + '\n');
console.log(`Assigned ${briefs.length} story covers using ${Object.keys(originals).length} existing images, at most three uses each.`);
