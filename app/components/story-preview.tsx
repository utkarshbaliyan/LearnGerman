'use client';
import { useState } from 'react';
import Link from 'next/link';

export type PreviewToken = { text: string; key?: string };
export type StoryPreviewData = { id: string; title: string; level: string; goal: string; paragraphs: PreviewToken[][]; glosses: Record<string, string>; storyCount: number };

export function StoryPreview({ preview }: { preview: StoryPreviewData }) {
  const [selected, setSelected] = useState<{ word: string; key: string } | null>(null);
  const meaning = selected ? preview.glosses[selected.key] : undefined;
  return <section className="story-preview" aria-labelledby="story-preview-title">
    <div className="story-preview-copy">
      <h2 id="story-preview-title">Try it: tap any German word</h2>
      <p>This is the start of “<span lang="de">{preview.title}</span>”, an {preview.level} story. Every story works like this, with audio, translations and a short quiz.</p>
    </div>
    <div className="story-preview-text" lang="de">
      {preview.paragraphs.map((tokens, p) => <p key={p}>{tokens.map((token, i) => token.key && preview.glosses[token.key]
        ? <button key={i} type="button" className="story-preview-word" aria-pressed={selected?.key === token.key} onClick={() => setSelected({ word: token.text, key: token.key! })}>{token.text}</button>
        : <span key={i}>{token.text}</span>)}</p>)}
    </div>
    <p className="story-preview-meaning" role="status" aria-live="polite">{selected && meaning ? <><strong lang="de">{selected.word}</strong> <span aria-hidden="true">→</span> {meaning}</> : 'Tap a word above to see what it means.'}</p>
    <div className="story-preview-actions">
      <Link className="reading-primary" href={`/stories/${preview.id}`}>Read the full story</Link>
      <Link href="/stories">Browse all {preview.storyCount} stories →</Link>
    </div>
  </section>;
}
