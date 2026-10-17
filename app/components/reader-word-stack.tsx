'use client';
import { useEffect, useRef, useState } from 'react';
import { Layers3, Plus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { vocabularyCardKey, isVocabularyReview, type CollectWordInput, type WordSource } from '@/app/lib/progress-sync';
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
  return { collect, stack: <ReaderWordStack words={words} sourceKind={source.kind} vocabulary={vocabulary} remove={key => setWords(current => current.filter(w => vocabularyCardKey(w) !== key))} /> };
}

function ReaderWordStack({ words, sourceKind, vocabulary, remove }: { words: CollectWordInput[]; sourceKind: WordSource['kind']; vocabulary: ReturnType<typeof useVocabularyProgress>; remove: (key: string) => void }) {
  const { progress, hydrated, saveWords, storageError } = vocabulary;
  const panel = useRef<HTMLElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const savedForReview = (word: CollectWordInput) => Boolean(progress.words?.[vocabularyCardKey(word)]) && isVocabularyReview(progress, word);
  const pending = words.filter(word => !savedForReview(word));
  function addToReview() {
    if (!hydrated || !pending.length) return;
    if (saveWords(pending)) setAnnouncement(`${pending.length} ${pending.length === 1 ? 'word added' : 'words added'} to review.`);
  }
  return <aside ref={panel} className="reader-word-stack" aria-label="Add words to review">{words.length > 0 && <Button className="reader-stack-jump" size="sm" onClick={() => panel.current?.scrollIntoView({ behavior: 'auto', block: 'start' })}><Layers3 size={16} /> Selected words · {words.length}</Button>}<details open>
    <summary><Layers3 size={20} /><span>Add to review <small>{words.length} selected</small></span></summary>
    <div className="reader-stack-body"><p>{`Click on the words in the ${sourceKind} to add them to review.`}</p>
    {words.length > 0 && <ul>{words.map(word => {
      const key = vocabularyCardKey(word);
      return <li key={key}><div className="reader-stack-word"><strong lang="de">{word.german}</strong>{savedForReview(word) && <Check size={16} aria-label="Saved for review" />}<button type="button" aria-label={`Remove ${word.german} from selection`} onClick={() => remove(key)}><X size={15} /></button></div><p lang="en">{word.english}</p></li>;
    })}</ul>}
    <Button size="sm" disabled={!hydrated || !pending.length} onClick={addToReview}><Plus size={14} /> Add to review</Button>
    <span className="sr-only" role="status">{announcement}</span>
    {storageError && <p role="alert">{storageError}</p>}
    </div></details></aside>;
}
