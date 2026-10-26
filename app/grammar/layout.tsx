import { pageMetadata } from '@/app/lib/seo';

export const metadata = pageMetadata('German Grammar Practice — A1 to C1', 'Learn German grammar with explanations, examples, case tables and exercises from A1 to C1. Practise at your level and save your progress.', '/grammar');

export default function GrammarLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
