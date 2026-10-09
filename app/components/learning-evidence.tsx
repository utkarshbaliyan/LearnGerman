'use client';
import { delayedRecallSummary, type LearningProgress } from '@/app/lib/learning-state';
import type { TranslationMemory } from '@/app/lib/translation-memory';
export function LearningEvidence({ progress, memory }: { progress: LearningProgress; memory: TranslationMemory | null }) {
  const recall = delayedRecallSummary(progress), sessions = Object.values(progress.sessions).filter(s => s.finishedAt), complete = sessions.filter(s => !s.outputSkipped).length;
  return <section className="learning-evidence" aria-labelledby="learning-evidence-title"><span className="reading-eyebrow">Your learning evidence</span><h2 id="learning-evidence-title">What you can recall and use</h2><div className="learning-evidence-grid">
    <article><span>Seven-day word recall</span><strong>{recall.total ? `${recall.correct} / ${recall.total}` : 'Not checked yet'}</strong><p>Model words matched after at least seven days since their last recorded practice, before revealing or using source-sentence help.</p></article>
    <article><span>Fresh-context delayed output</span><strong>{memory?.delayed.total ? `${memory.delayed.correct} / ${memory.delayed.total}` : 'Not checked yet'}</strong><p>First translations accepted by AI in new review contexts after at least seven days since the last recorded practice of that review item. Help use is self-reported; revisions are excluded.</p></article>
    <article><span>Completed sessions</span><strong>{sessions.length}</strong><p>{complete} included checked German output. Activity history is separate from recall and language ability.</p></article>
  </div><p className="learning-evidence-note">These are practice records, not a CEFR assessment. AI feedback can be wrong. Word checks match saved forms; they do not assess all valid translations or capitalization. Results cover your retained history: up to 1,000 word attempts and 200 recent translation sets.</p></section>;
}
