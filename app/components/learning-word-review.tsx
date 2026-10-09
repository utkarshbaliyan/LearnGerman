'use client';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { DAY, recallMatches } from '@/app/lib/learning-state';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';
import { vocabularyCardKey, type VocabularyIdentity } from '@/app/lib/progress-sync';

export type ReviewWord = { key: string; german: string; english: string; context?: string; storyId?: string; sourceHref?: string; sourceTitle?: string; vocabulary?: VocabularyIdentity };
export function LearningWordReview({ word, onDone }: { word: ReviewWord; onDone: () => void }) {
  const { progress: vocabulary, rateFlashcard, storageError, hydrated } = useVocabularyProgress();
  const [answer, setAnswer] = useState(''), [help, setHelp] = useState(false), [result, setResult] = useState<boolean | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const checking = useRef(false);
  async function check(reveal = false) {
    if (checking.current || result !== null) return;
    checking.current = true;
    setBusy(true); setError('');
    const owner = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    const at = Date.now(), assisted = help || reveal;
    const matched = !reveal && word.german.split(',').some(expected => recallMatches(answer, expected));
    const identity = word.vocabulary ?? { german: word.german, english: word.english, progressByHeadword: true };
    const key = vocabularyCardKey(identity), previous = vocabulary.cards?.[key];
    const last = previous?.memory?.last_review ?? previous?.updatedAt ?? vocabulary.words?.[key]?.createdAt;
    const attempt = { id: crypto.randomUUID(), key, at, correct: matched, assisted, elapsedDays: last ? Math.max(0, (at - last) / DAY) : 0 };
    try {
      if (owner !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) return;
      await rateFlashcard(identity, matched && !assisted ? 3 : 1, attempt);
      if (owner !== localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY)) return;
      setResult(matched); if (reveal) setHelp(true);
    } catch (cause) { console.warn('Word review save failed.', cause); setError('Your review could not be saved. Try again.'); }
    finally { checking.current = false; setBusy(false); }
  }
  return <section className="learning-recall" aria-label="Word recall"><span className="reading-eyebrow">Recall before revealing</span><h2>{word.english}</h2><p>Write the saved German word or form. Articles are part of the model when shown.</p><label htmlFor="learning-recall-answer">German word or phrase</label><input id="learning-recall-answer" lang="de" autoComplete="off" spellCheck={false} maxLength={150} value={answer} disabled={busy || result !== null} onChange={e => setAnswer(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && answer.trim()) void check(); }} />
    {result === null ? <><div className="learning-actions"><Button disabled={!hydrated || busy || !answer.trim()} onClick={() => void check()}>Check recall</Button><Button variant="outline" disabled={!hydrated || busy} onClick={() => void check(true)}>Reveal · I forgot</Button>{word.context && <button type="button" disabled={busy} onClick={() => setHelp(true)}>Show source sentence</button>}</div>{help && word.context && <p lang="de">{word.context}</p>}</> : <div aria-live="polite"><p>{result ? 'You recalled the model word.' : 'Your answer differs from the saved model. Other translations may be valid.'}</p><strong lang="de">{word.german}</strong>{word.context && <p lang="de">{word.context}</p>}{(word.sourceHref || word.storyId) && <a href={word.sourceHref ?? `/stories/${word.storyId}`}>Read the source →</a>}<p>{help ? 'Assisted review recorded.' : 'First recall attempt recorded.'} Capitalization is not assessed here.</p><Button disabled={busy} onClick={onDone}>Next</Button></div>}
    {(error || storageError) && <p role="alert">{error || storageError}</p>}
  </section>;
}
