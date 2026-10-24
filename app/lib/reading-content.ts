import { getReadingStory } from './reading-path';
import { readingGlosses } from './reading-glossary';
import { getReadingSentenceTranslations } from './reading-sentence-translations';
import earlierManifest from './reading-audio-manifest.json';
import b2Manifest from '../../content/reading/b2/audio-manifest.json';
import compatibleManifest from '../../content/reading/compatible/audio-manifest.json';
const manifest = {...earlierManifest, ...b2Manifest};
import type { NarrationAsset } from './reading-narration';
export { readingGlosses } from './reading-glossary';
export function getReadingContent(id: string) {
  const story = getReadingStory(id);
  if (!story) return null;
  const audio = (manifest as Record<string, NarrationAsset>)[story.id];
  const compatible = (compatibleManifest as Record<string, { src: string; sourceSrc: string; textHash: string; duration: number }>)[story.id];
  const current = audio && compatible?.sourceSrc === audio.src && compatible.textHash === audio.textHash && Math.abs(compatible.duration - audio.duration) <= .15;
  return { story, audio: current ? { ...audio, compatibleSrc: compatible.src } : audio, glosses: readingGlosses(story), sentenceTranslations: getReadingSentenceTranslations(story) };
}
