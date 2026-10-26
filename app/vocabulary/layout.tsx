import { pageMetadata } from '@/app/lib/seo';


export const metadata = pageMetadata('German Vocabulary Practice — A1 to C1', 'Learn German vocabulary with free flashcards, word meanings and review by level, topic and word class, from A1 to C1.', '/vocabulary');

export default function VocabularyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
