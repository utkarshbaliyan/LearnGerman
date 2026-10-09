import Link from 'next/link';
import { isVocabularyLearned, isVocabularyReview, type VocabularyProgress } from '@/app/lib/progress-sync';
export function ConnectedWordProgress({ vocabulary }: { vocabulary: VocabularyProgress }) {
  const words = Object.values(vocabulary.words ?? {}), now = Date.now();
  const review = words.filter(w => isVocabularyReview(vocabulary, w));
  const due = Object.entries(vocabulary.words ?? {}).filter(([key, w]) => isVocabularyReview(vocabulary, w) && (vocabulary.cards?.[key]?.dueAt ?? 0) <= now).length;
  return <section className="connected-word-progress" aria-label="Connected word progress"><div><span className="reading-eyebrow">One shared word deck</span><h2>Your collected words</h2><p>Words from stories and books follow the same progress and schedule everywhere.</p></div><dl><div><dt>Saved words</dt><dd>{words.length}</dd></div><div><dt>In review</dt><dd>{review.length}</dd></div><div><dt>Due now</dt><dd>{due}</dd></div><div><dt>Marked familiar</dt><dd>{words.filter(w => isVocabularyLearned(vocabulary, w)).length}</dd></div></dl><Link href="/vocabulary?collection=reading&view=practice">Practise collected words →</Link></section>;
}
