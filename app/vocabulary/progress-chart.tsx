type ProgressChartProps = {
  learned: number;
  review: number;
  unlearned: number;
  hydrated: boolean;
  scope: string;
};

export function VocabularyProgressChart({ learned, review, unlearned, hydrated, scope }: ProgressChartProps) {
  const segments = [
    { key: "learned", label: "Learned", count: learned },
    { key: "review", label: "Review", count: review },
    { key: "unlearned", label: "Unlearned", count: unlearned },
  ];
  const total = learned + review + unlearned;
  let offset = 0;

  return (
    <section className="vocab-progress-summary" aria-label="Vocabulary progress" aria-busy={!hydrated}>
      <svg className="vocab-progress-pie" viewBox="0 0 120 120" role="img"
        aria-label={!hydrated ? "Loading vocabulary progress" : total === 0 ? "No words in this collection" : `${learned.toLocaleString("en")} learned, ${review.toLocaleString("en")} in review, ${unlearned.toLocaleString("en")} unlearned`}>
        {!hydrated || total === 0 ? <circle className="vocab-pie-empty" cx="60" cy="60" r="56" /> : segments.map(({ key, count }) => {
          if (!count) return null;
          if (count === total) return <circle key={key} className={`vocab-pie-${key}`} cx="60" cy="60" r="56" />;
          const start = offset / total * 2 * Math.PI - Math.PI / 2;
          offset += count;
          const end = offset / total * 2 * Math.PI - Math.PI / 2;
          const point = (angle: number) => `${60 + 56 * Math.cos(angle)} ${60 + 56 * Math.sin(angle)}`;
          return <path key={key} className={`vocab-pie-${key}`} d={`M 60 60 L ${point(start)} A 56 56 0 ${count / total > .5 ? 1 : 0} 1 ${point(end)} Z`} />;
        })}
      </svg>
      <div className="vocab-progress-copy">
        <h2>Your word progress</h2>
        <p>{scope} · {total.toLocaleString("en")} words</p>
        <small>{!hydrated ? "Loading your progress…" : total === 0 ? "Collect words while reading to see your progress here." : "Learned means marked familiar. Review words stay in your practice queue."}</small>
      </div>
      <dl className="vocab-progress-legend">
        {segments.map(({ key, label, count }) => <div key={key}>
          <dt><span className={`vocab-legend-dot vocab-pie-${key}`} aria-hidden="true" />{label}</dt>
          <dd>{hydrated ? count.toLocaleString("en") : "—"}<small>{hydrated && total > 0 ? count > 0 && count / total < .001 ? "<0.1%" : `${(count / total * 100).toLocaleString("en", { maximumFractionDigits: 1 })}%` : ""}</small></dd>
        </div>)}
      </dl>
    </section>
  );
}
