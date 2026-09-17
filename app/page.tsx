import { redirect } from 'next/navigation';

export default function HomePage() {
  // Resume the integrated course here after Stories, Vocabulary and Grammar reach C1.
  redirect('/stories');
}
