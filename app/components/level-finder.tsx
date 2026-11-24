'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Compass } from 'lucide-react';
import type { ReadingLevel } from '@/app/lib/reading-path';
import { storyLevelPath } from '@/app/lib/story-levels';
import { bookForLevel } from '@/app/lib/book-catalog';

const SAMPLES: { level: ReadingLevel; label: string; sample: string; firstStoryId: string; note: string }[] = [
  {
    level: 'A1',
    label: 'A1 · Beginner',
    sample: '„Hallo! Ich heiße Mia. Ich wohne in Bonn. Bist du auch im Deutschkurs?“',
    firstStoryId: 'reading-a1-01-v1',
    note: 'Short everyday exchanges with slow audio and tap-to-translate words.',
  },
  {
    level: 'A2',
    label: 'A2 · Elementary',
    sample: '„Morgen kommt ein Paket für mich. Kannst du es bitte annehmen? Ich bin erst ab sechs Uhr wieder da.“',
    firstStoryId: 'reading-a2-01-v1',
    note: 'Everyday requests, shared plans, and connected short stories.',
  },
  {
    level: 'B1',
    label: 'B1 · Intermediate',
    sample: '„Das Hostel am Bahnhof ist günstig, aber am Abend ist es dort oft laut. Deshalb schaut sie sich noch ein ruhiges Gästehaus an.“',
    firstStoryId: 'reading-b1-01-v2',
    note: 'Longer stories with opinions, work life, and multi-step decisions.',
  },
  {
    level: 'B2',
    label: 'B2 · Upper intermediate',
    sample: '„Die Mieterversammlung stimmt dem Vorschlag fast einstimmig zu, doch erst später fällt auf, wen die neuen Kosten tatsächlich treffen.“',
    firstStoryId: 'reading-b2-01-v1',
    note: 'Nuanced arguments, competing viewpoints, and implied meaning.',
  },
];

export function LevelFinder() {
  const [selected, setSelected] = useState<ReadingLevel | null>(null);
  const picked = SAMPLES.find(item => item.level === selected);
  const matchingBook = picked ? bookForLevel(picked.level) : undefined;

  return <details className="level-finder">
    <summary><Compass size={18} aria-hidden="true" /> Not sure which level fits you? Find your starting level in 30 seconds</summary>
    <div className="level-finder-body">
      <p>Pick the most challenging sentence you can understand without translating every word:</p>
      <div className="level-finder-grid" role="group" aria-label="Choose a sample German sentence">
        {SAMPLES.map(item => <button key={item.level} type="button" className={selected === item.level ? 'is-selected' : undefined} aria-pressed={selected === item.level} onClick={() => setSelected(item.level)}>
          <span className="level-finder-tag">{item.label}</span>
          <span lang="de">{item.sample}</span>
        </button>)}
      </div>
      {picked && <div className="level-finder-result" role="status" aria-live="polite">
        <p><strong>Start at {picked.level}.</strong> {picked.note}</p>
        <div className="level-finder-links">
          <Link className="reading-primary" href={`/stories/${picked.firstStoryId}`}>Start your first {picked.level} story <ArrowRight size={16} aria-hidden="true" /></Link>
          <Link href={storyLevelPath(picked.level)}>Browse all {picked.level} stories →</Link>
          {matchingBook && <Link href={matchingBook.path}>Or read the {picked.level} book: <span lang="de">{matchingBook.title}</span> →</Link>}
        </div>
      </div>}
    </div>
  </details>;
}
