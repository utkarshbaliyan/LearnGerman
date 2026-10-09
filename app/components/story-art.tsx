import artwork from '@/content/illustrations/story-art-manifest.json';

type Cover = { url: string };

export function StoryArt({ storyId, level, number, className = '' }: { storyId: string; level: string; number: number; className?: string }) {
  const cover = (artwork as Record<string, Cover>)[storyId];
  if (!cover) return <span className={`story-art story-art--numbered ${className}`} aria-hidden="true"><span>{level}</span><strong>{String(number).padStart(2, '0')}</strong></span>;
  return <span className={`story-art ${className}`}><img src={cover.url} alt="" width="1024" height="1024" loading="lazy" decoding="async" /></span>;
}
