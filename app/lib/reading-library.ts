import type { ReadingLevel, ReadingSummary } from './reading-path';
import topics from './reading-topics.json';

const normalise = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
const aliases: Record<string, string> = { home: 'house apartment flat housing', health: 'hospital illness doctor dentist', work: 'office job', colours: 'colors colour color', nature: 'outdoors forest plants', family: 'relatives parents children' };

export function filterReadingStories(stories: ReadingSummary[], level: ReadingLevel, topic: string, query: string, narratedOnly = false) {
  const terms = normalise(query.trim()).split(/\s+/).filter(Boolean);
  return stories.filter(story => story.level === level && (topic === 'all' || story.topics.includes(topic)) && (!narratedOnly || story.hasAudio) && terms.every(term => normalise(`${story.title} ${story.goal} ${story.topics.map(key => `${key} ${(topics as Record<string, string>)[key] ?? ''} ${aliases[key] ?? ''}`).join(' ')} ${story.grammar}`).includes(term)));
}
