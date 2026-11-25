'use client';
import { useMemo, useState } from 'react';
import { useVocabularyProgress } from '@/app/hooks/use-vocabulary-progress';
import { vocabularyCardKey, vocabularyReviewDueAt } from '@/app/lib/progress-sync';
import { VocabularyRow, VocabularyTable, sortVocabularyWords, type VocabularySortDirection } from '@/app/vocabulary/word-list';
import type { CourseWord } from '@/app/video-course/course-vocab';
import type { CourseSource } from '@/app/video-course/course-words';
import { playLine } from '@/app/video-course/audio';

/** The lesson's words in the same table as the Vocabulary page; marks are shared with it. */
export function LessonWords({ words, source }: { words: CourseWord[]; source: CourseSource }) {
  const v = useVocabularyProgress();
  const [direction, setDirection] = useState<VocabularySortDirection>('asc');
  const [visible, setVisible] = useState(true);
  const [overrides, setOverrides] = useState<Set<string>>(new Set());
  const [speaking, setSpeaking] = useState<string | null>(null);
  const byId = useMemo(() => new Map(words.map(w => [w.word.id, w])), [words]);
  const rows = useMemo(() => sortVocabularyWords([...byId.values()].map(w => w.word), direction), [byId, direction]);

  const collect = (w: CourseWord) => v.saveWord({ german: w.identity.german, english: w.identity.english,
    context: `A1 video course · Episode ${source.episode}: ${source.title}`,
    source: { kind: 'course', id: `a1-e${source.episode}`, title: `A1 Episode ${source.episode}: ${source.title}`, href: source.href, level: 'A1' } });
  function toggleReview(w: CourseWord) {
    if (v.isReview(w.identity)) v.setReview(w.identity, false);
    else if (w.personal) collect(w); else v.setReview(w.identity, true);
  }
  function toggleLearned(w: CourseWord) {
    const learned = v.isLearned(w.identity);
    if (!learned && w.personal) collect(w);
    v.setLearned(w.identity, !learned);
  }
  async function listen(w: CourseWord) { setSpeaking(w.word.id); await playLine({ who: 'T', text: w.de }); setSpeaking(c => c === w.word.id ? null : c); }

  return <div className="vc-lesson-words">
    <p className="vc-hint">Same list as your Vocabulary: marks you make here show up there.</p>
    <VocabularyTable direction={direction} translationsVisible={visible}
      onSort={() => setDirection(d => d === 'asc' ? 'desc' : 'asc')} onToggleTranslations={() => { setVisible(x => !x); setOverrides(new Set()); }}>
      {rows.map(word => { const w = byId.get(word.id)!; return <VocabularyRow key={word.id} word={word}
        saved={v.progress.words?.[vocabularyCardKey(w.identity)]} translationVisible={visible !== overrides.has(word.id)}
        completed={v.isLearned(w.identity)} review={v.isReview(w.identity)} dueAt={vocabularyReviewDueAt(v.progress, w.identity)}
        speaking={speaking === word.id} hydrated={v.hydrated}
        onReveal={() => setOverrides(s => { const n = new Set(s); if (n.has(word.id)) n.delete(word.id); else n.add(word.id); return n; })}
        onComplete={() => toggleLearned(w)} onReview={() => toggleReview(w)} onPronounce={() => listen(w)} />; })}
    </VocabularyTable>
  </div>;
}
