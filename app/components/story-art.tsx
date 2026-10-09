import artwork from '@/content/illustrations/story-art-manifest.json';

type Cover = { url: string };

export function StoryArt({ storyId, className = '' }: { storyId: string; className?: string }) {
  const cover = (artwork as Record<string, Cover>)[storyId];
  if (!cover) return null;
  return <span className={`story-art ${className}`}><img src={cover.url} alt="" width="1024" height="1024" loading="lazy" decoding="async" /></span>;
}
