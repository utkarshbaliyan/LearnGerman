import type { GrammarLessonContent } from './course';
import { GRAMMAR_SOURCES } from './sources';
import { grammarReferenceParagraphs } from './practice-sequence';

export function LessonReference({ content }: { content: GrammarLessonContent }) {
  return <details className="grammar-reference-notes">
    <summary>More on this topic <span>Full notes and rule sources</span></summary>
    <div className="grammar-reference-content">
      <section aria-label="Further explanation">{grammarReferenceParagraphs(content).map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
      {content.sources && <section className="grammar-rule-sources"><h3>Rule references</h3><ul>{content.sources.map(id => <li key={id}><a href={GRAMMAR_SOURCES[id].url} target="_blank" rel="noreferrer">{GRAMMAR_SOURCES[id].title}</a></li>)}</ul></section>}
    </div>
  </details>;
}
