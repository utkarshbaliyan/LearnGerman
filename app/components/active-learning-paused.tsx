import Link from 'next/link';

export function ActiveLearningPaused() {
  return <section className="learning-empty" role="status">
    <h2>Active Learning is paused</h2>
    <p>Your saved practice is kept. You can continue with stories, books, vocabulary and grammar.</p>
    <Link href="/stories">Explore stories →</Link>
  </section>;
}
