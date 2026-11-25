'use client';
import { useEffect, useState, type ReactNode } from 'react';
import type { Block, BlockId } from '@/app/video-course/types';
import { readEpisode, onProgressChange, type EpisodeProgress } from '@/app/video-course/progress';
import { ExerciseSet, PASS } from '@/app/video-course/exercise-set';

export function EpisodeBlocks({ episode, blocks, extras, next }: { episode: number; blocks: Block[]; extras: Partial<Record<BlockId, ReactNode>>; next?: { href: string; title: string } }) {
  const [active, setActive] = useState<BlockId>(blocks[0].id);
  const [progress, setProgress] = useState<EpisodeProgress>({ blocks: {} });
  useEffect(() => { const update = () => setProgress(readEpisode(episode)); update(); return onProgressChange(update); }, [episode]);
  useEffect(() => { const h = location.hash.slice(1) as BlockId; if (blocks.some(b => b.id === h)) setActive(h); }, [blocks]);

  const status = (id: BlockId) => { const b = progress.blocks[id]; return !b ? '' : b.score / b.total >= PASS ? 'is-done' : 'is-started'; };
  const doneCount = blocks.filter(b => status(b.id) === 'is-done').length;
  const go = (id: BlockId) => { setActive(id); history.replaceState(null, '', `#${id}`); document.getElementById('vc-blocks')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  const test = progress.blocks.test, passed = !!test && test.score / test.total >= PASS;
  return <div id="vc-blocks" className="vc-blocks">
    {passed && <div className="vc-complete" role="status"><strong>🎉 Episode {episode} complete!</strong> Test: {Math.round(test.score / test.total * 100)} %.
      {next ? <> Next up: <a href={next.href}>{next.title} →</a></> : null}
      <span>Tip: come back in 2–3 days and redo the flashcards and your mistakes. Spaced review is what makes words stick.</span></div>}
    <nav className="vc-steps" aria-label="Episode practice">
      {blocks.map((b, i) => { const p = progress.blocks[b.id]; return <button key={b.id} type="button" data-block={b.id} aria-current={active === b.id ? 'step' : undefined} className={status(b.id)} onClick={() => go(b.id)}>
        <span className="vc-step-n">{status(b.id) === 'is-done' ? '✓' : i + 1}</span><span>{b.title}</span>{p && <small>{Math.round(p.score / p.total * 100)} %</small>}
      </button>; })}
      <span className="vc-steps-total">{doneCount} / {blocks.length} done</span>
    </nav>
    {blocks.map((b, i) => <section key={b.id} hidden={active !== b.id} className="vc-block" data-block={b.id} aria-label={b.title}>
      <h2>{i + 1}. {b.title}</h2><p className="vc-block-intro">{b.intro}</p>
      {extras[b.id]}
      <ExerciseSet episode={episode} block={b.id} sections={b.sections} />
      {i + 1 < blocks.length && <button type="button" className="vc-btn vc-next" onClick={() => go(blocks[i + 1].id)}>Next: {blocks[i + 1].title} →</button>}
    </section>)}
  </div>;
}
