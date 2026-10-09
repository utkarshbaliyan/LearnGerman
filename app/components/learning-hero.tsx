import { TopicArt } from './topic-art';

export function LearningHero({ kind }: { kind: 'today' | 'review' }) {
  const today = kind === 'today';
  return <header className={`learning-header learning-hero learning-hero--${kind}`}>
    <div className="learning-hero-copy">
      <span className="reading-eyebrow">{today ? 'A little German, used well' : 'Keep what you learn'}</span>
      <h1>{today ? 'TODAY & REVIEW' : 'YOUR REVIEW'}</h1>
      <p>{today ? 'Build your daily session or create a small word deck. Recall first, then read, listen and use German.' : 'Revisit saved words and practise past mistakes in fresh situations.'}</p>
      <div className="learning-hero-tags" aria-label={today ? 'Session activities' : 'Review activities'}>
        {(today ? ['Recall', 'Read & listen', 'Use German'] : ['Saved words', 'Vocabulary', 'Fresh practice']).map(label => <span key={label}>{label}</span>)}
      </div>
    </div>
    <div className="learning-hero-art" aria-hidden="true">
      {today ? <img src="/illustrations/reading-room.png" alt="" width="1536" height="1024" decoding="async" /> : <><TopicArt kind="learn" className="learning-hero-book" /><TopicArt kind="nature" className="learning-hero-plant" /></>}
    </div>
  </header>;
}
