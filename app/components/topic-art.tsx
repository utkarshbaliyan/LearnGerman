import type { CSSProperties } from 'react';

export type ArtKind = 'home' | 'work' | 'travel' | 'cafe' | 'shopping' | 'learn' | 'friends' | 'nature' | 'sport' | 'celebrate' | 'culture' | 'technology';

const artwork: Record<ArtKind, { column: number; row: number; tint: string }> = {
  home: { column: 0, row: 0, tint: 'var(--art-sage)' },
  work: { column: 1, row: 0, tint: 'var(--art-lilac)' },
  travel: { column: 2, row: 0, tint: 'var(--art-blue)' },
  cafe: { column: 3, row: 0, tint: 'var(--art-peach)' },
  shopping: { column: 0, row: 1, tint: 'var(--art-butter)' },
  learn: { column: 1, row: 1, tint: 'var(--art-lilac)' },
  friends: { column: 2, row: 1, tint: 'var(--art-peach)' },
  nature: { column: 3, row: 1, tint: 'var(--art-sage)' },
  sport: { column: 0, row: 2, tint: 'var(--art-blue)' },
  celebrate: { column: 1, row: 2, tint: 'var(--art-butter)' },
  culture: { column: 2, row: 2, tint: 'var(--art-peach)' },
  technology: { column: 3, row: 2, tint: 'var(--art-lilac)' },
};

export function storyArt(topics: readonly string[]): ArtKind {
  const value = topics.join(' ');
  const matches: [RegExp, ArtKind][] = [
    [/celebr|party|birthday|festival/, 'celebrate'],
    [/food|cooking|cafe|coffee|restaurant|hospitality/, 'cafe'],
    [/travel|transport|train|airport|hotel|holiday/, 'travel'],
    [/shopping|market|service|store/, 'shopping'],
    [/work|office|career|job|ethics/, 'work'],
    [/school|educat|study|university|learning/, 'learn'],
    [/sport|gym|health|medical|doctor/, 'sport'],
    [/environment|nature|weather|garden|outdoor/, 'nature'],
    [/culture|music|art|museum/, 'culture'],
    [/technology|digital|media|online|phone/, 'technology'],
    [/friend|relationship|encounter|social/, 'friends'],
    [/home|housing|family|neighbour/, 'home'],
  ];
  return matches.find(([pattern]) => pattern.test(value))?.[1] ?? 'learn';
}

/** Decorative artwork; the surrounding heading supplies the accessible name. */
export function TopicArt({ kind, className = '' }: { kind: ArtKind; className?: string }) {
  const { column, row, tint } = artwork[kind];
  const style = {
    '--art-tint': tint,
    '--art-x': `${column / 3 * 100}%`,
    '--art-y': `${row / 2 * 100}%`,
    '--art-clip-top': row === 1 ? '8%' : '0%',
  } as CSSProperties;
  return <span className={`topic-art ${className}`} style={style} data-art={kind} aria-hidden="true"><span className="topic-art-picture" /></span>;
}
