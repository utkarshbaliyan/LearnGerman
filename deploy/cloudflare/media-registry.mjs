import book from '../../content/books/zwischen-hoersaal-und-arbeitswelt/media-registry.json' with { type: 'json' };
import stories from '../../content/reading/b2/media-registry.json' with { type: 'json' };
import art from '../../content/illustrations/story-art-registry.json' with { type: 'json' };
import compatible from '../../content/reading/compatible/media-registry.json' with { type: 'json' };
import legacy from './legacy-audio-registry.json' with { type: 'json' };
export const mediaRegistry = Object.freeze({ ...book, ...stories, ...art, ...compatible });
export const staticMediaRegistry = Object.freeze({ ...mediaRegistry, ...legacy });
