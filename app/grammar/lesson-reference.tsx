import type { GrammarLessonContent } from './course';
import { GRAMMAR_SOURCES } from './sources';

export function LessonReference({ content }: { content: GrammarLessonContent }) {
  return <details className="grammar-reference-notes">
    <summary>Explore the rule sources <span>Further reading for this topic</span></summary>
    <div className="grammar-reference-content">
      {content.sources && <section className="grammar-rule-sources"><h3>Rule references</h3><ul>{content.sources.map(id => <li key={id}><a href={GRAMMAR_SOURCES[id].url} target="_blank" rel="noreferrer">{GRAMMAR_SOURCES[id].title}</a></li>)}</ul></section>}
      {!content.sources?.length && <p><a href="/grammar/reference">Open the complete grammar reference</a></p>}
    </div>
  </details>;
}
