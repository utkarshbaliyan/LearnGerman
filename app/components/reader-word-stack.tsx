'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { Layers3, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { vocabularyCardKey, isVocabularyLearned, isVocabularyReview, MAX_COLLECTED_WORDS, type CollectWordInput, type WordSource } from '@/app/lib/progress-sync';
import { CLOUD_PROGRESS_OWNER_STORAGE_KEY } from '@/app/lib/cloud-progress-keys';

export function useReaderWordStack(source: WordSource) {
  const vocabulary = useVocabularyProgress();
  const [words, setWords] = useState<CollectWordInput[]>([]);
  const owner = useRef<string | null>(null);
  useEffect(() => {
    const id = localStorage.getItem(CLOUD_PROGRESS_OWNER_STORAGE_KEY);
    if (owner.current !== id) { owner.current = id; setWords([]); }
  }, [vocabulary.progress]);
  function collect(german: string, english: string, context: string) {
    const word: CollectWordInput = { german, english, context: context.slice(0, 600), source };
    const key = vocabularyCardKey(word);
    setWords(current => [word, ...current.filter(w => vocabularyCardKey(w) !== key)].slice(0, 50));
  }
  return { collect, stack: <ReaderWordStack words={words} vocabulary={vocabulary} remove={key => setWords(current => current.filter(w => vocabularyCardKey(w) !== key))} /> };
}

function ReaderWordStack({ words, vocabulary, remove }: { words: CollectWordInput[]; vocabulary: ReturnType<typeof useVocabularyProgress>; remove: (key: string) => void }) {
  const { progress, hydrated, saveWord, storageError } = vocabulary;
  const panel = useRef<HTMLElement>(null);
  const count = Object.keys(progress.words ?? {}).length;
  return <aside ref={panel} className="reader-word-stack" aria-label="Collected word stack">{words.length > 0 && <Button className="reader-stack-jump" size="sm" onClick={() => panel.current?.scrollIntoView({ behavior: 'auto', block: 'start' })}><Layers3 size={16} /> Word stack · {words.length}</Button>}<details open>
    <summary><Layers3 size={20} /><span>Word stack <small>{words.length} collected here</small></span></summary>
    <div className="reader-stack-body"><p>Click words as you read. Add to review saves them in Vocabulary, Review and Flashcards.</p>
    {!words.length ? <div className="reader-stack-empty">Your next useful word starts here.</div> : <ul>{words.map(word => {
      const key = vocabularyCardKey(word), review = isVocabularyReview(progress, word), saved = Boolean(progress.words?.[key]), familiar = isVocabularyLearned(progress, word);
      const dueAt = progress.cards?.[key]?.dueAt;
      return <li key={key}><div className="reader-stack-word"><strong lang="de">{word.german}</strong><button type="button" aria-label={`Remove ${word.german} from stack`} onClick={() => remove(key)}><X size={15} /></button></div><p lang="en">{word.english}</p>
        {word.context && <details className="reader-stack-context"><summary>Source sentence</summary><p lang="de">{word.context}</p></details>}
        <Button size="sm" variant={saved && review ? 'outline' : 'default'} disabled={!hydrated || saved && review || count >= MAX_COLLECTED_WORDS && !saved} onClick={() => saveWord(word)}>{saved && review ? <><Check size={14} /> Saved for review</> : <><Plus size={14} /> Add to review</>}</Button>
        {review ? <small className="reader-stack-status">{dueAt && dueAt > Date.now() ? `Next review: ${new Date(dueAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'Ready to practise now'}</small> : familiar ? <small className="reader-stack-status">Marked familiar in Vocabulary</small> : null}
      </li>;
    })}</ul>}
    <div className="reader-stack-links"><Link href="/vocabulary">Word library →</Link><Link href="/?view=review">Flashcards & review →</Link></div>
    <p className="reader-stack-note">Saved words share one schedule across sections. Sign in to sync across devices.</p>
    {count >= MAX_COLLECTED_WORDS && <p role="status">Your collected deck has {count} words. Existing words remain available.</p>}{storageError && <p role="alert">{storageError}</p>}
    </div></details></aside>;
}
