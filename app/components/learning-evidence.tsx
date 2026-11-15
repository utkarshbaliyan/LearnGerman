'use client';
import { delayedRecallSummary, type LearningProgress } from '@/app/lib/learning-state';
import type { TranslationMemory } from '@/app/lib/translation-memory';
import { TopicArt } from './topic-art';
import { ACTIVE_LEARNING_ENABLED } from '@/app/lib/feature-availability';
import type { VocabularyProgress } from '@/app/lib/progress-sync';
export function LearningEvidence({ progress, memory, vocabulary }: { progress: LearningProgress; memory: TranslationMemory | null; vocabulary: VocabularyProgress }) {
  const recall = delayedRecallSummary({ ...progress, recalls: { ...progress.recalls, ...vocabulary.recalls } }), sessions = Object.values(progress.sessions).filter(s => s.finishedAt), complete = sessions.filter(s => !s.outputSkipped).length;
  if (!recall.total && !memory?.delayed.total && !sessions.length) return null;
  const showWriting = ACTIVE_LEARNING_ENABLED || Boolean(memory?.delayed.total);
  return <section className="learning-evidence" aria-labelledby="learning-evidence-title"><h2 id="learning-evidence-title">What you still remember</h2><div className="learning-evidence-grid">
    <article data-tone="sage"><TopicArt kind="nature" className="learning-evidence-art" /><span>Words after a week</span><strong>{recall.total ? `${recall.correct} / ${recall.total}` : 'Not tested yet'}</strong><p>Words you recalled correctly at least a week after you last practised them, without peeking.</p></article>
    {showWriting && <article data-tone="lilac"><TopicArt kind="friends" className="learning-evidence-art" /><span>Sentences after a week</span><strong>{memory?.delayed.total ? `${memory.delayed.correct} / ${memory.delayed.total}` : 'Not tested yet'}</strong><p>New sentences you translated correctly on the first try, at least a week after you last practised the same point.</p></article>}
    <article data-tone="butter"><TopicArt kind="learn" className="learning-evidence-art" /><span>Sessions finished</span><strong>{sessions.length}</strong><p>{complete ? `${complete} included a writing check.` : 'Each session mixes review, a story and a quick check.'}</p></article>
  </div><p className="learning-evidence-note">This shows your practice, not an official level. Only your recent history is kept.</p></section>;
}
