import type { GrammarLessonContent } from './course';
import { GRAMMAR_SOURCES } from './sources';
import { grammarReferenceParagraphs } from './practice-sequence';

export function LessonReference({ content }: { content: GrammarLessonContent }) {
  const seen = new Set([content.examples[0].german]);
  const examples = [...content.examples, ...(content.sections ?? []).flatMap(section => section.examples ?? [])]
    .filter(example => { if (seen.has(example.german)) return false; seen.add(example.german); return true; });
  const tables = content.tables?.filter(table => !['Patterns in complete sentences', 'Error diagnosis', 'Target models and revisions'].includes(table.title));
  return <details className="grammar-reference-notes">
    <summary>Need more detail? <span>Forms, examples and exceptions</span></summary>
    <div className="grammar-reference-content">
      <section aria-label="Further explanation">{grammarReferenceParagraphs(content).map(paragraph => <p key={paragraph}>{paragraph}</p>)}</section>
      {tables?.map(table => <section className="grammar-reference-table" key={table.title}>
        <h3>{table.title}</h3>{table.caption && <p>{table.caption}</p>}
        <div><table><thead><tr>{table.headers.map(header => <th key={header} scope="col">{header}</th>)}</tr></thead><tbody>{table.rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>
      </section>)}
      {examples.length > 0 && <section className="grammar-examples"><h3>More examples</h3><div>{examples.map(example => <article key={example.german}><strong lang="de">{example.german}</strong><p>{example.english}</p></article>)}</div></section>}
      {content.sources && <section className="grammar-rule-sources"><h3>Rule references</h3><ul>{content.sources.map(id => <li key={id}><a href={GRAMMAR_SOURCES[id].url} target="_blank" rel="noreferrer">{GRAMMAR_SOURCES[id].title}</a></li>)}</ul></section>}
    </div>
  </details>;
}
