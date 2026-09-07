import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { RECALL_SHEETS } from "./sheets";

export const metadata: Metadata = {
  title: "German Case Cheat Sheets — LeseLaut",
  description: "Recall tables for all four German cases: articles, pronouns, adjective endings, noun declension, prepositions and verb patterns.",
};
export default function GrammarCheatSheets() {
  return <main className="site-shell grammar-page" id="top">
    <SiteHeader active="grammar" />
    <div className="recall-page">
      <header className="recall-header"><Link href="/grammar">← Grammar lessons</Link><p className="recall-eyebrow">Grammar · Quick reference</p><h1>German case cheat sheets</h1><p>Find a form, recall the pattern, then use it in your own sentence. Core A1–B1 case grammar, with rarer forms clearly marked.</p><div className="recall-case-key"><span>Nominativ · who?</span><span>Akkusativ · whom / what?</span><span>Dativ · to whom?</span><span>Genitiv · whose?</span></div></header>
      <div className="recall-layout">
        <nav className="recall-nav" aria-label="Cheat sheet topics"><h2>Jump to a table</h2>{RECALL_SHEETS.map((sheet, i) => <a key={sheet.id} href={`#${sheet.id}`}><span>{String(i + 1).padStart(2, "0")}</span>{sheet.title.split(" · ")[0]}</a>)}</nav>
        <div className="recall-sheets">{RECALL_SHEETS.map((sheet, i) => <section key={sheet.id} id={sheet.id} className="recall-sheet" aria-labelledby={`${sheet.id}-title`}>
          <div className="recall-sheet-heading"><span>{String(i + 1).padStart(2, "0")}</span><h2 id={`${sheet.id}-title`}>{sheet.title}</h2></div><p>{sheet.note}</p>
          <div className="recall-table-scroll" tabIndex={0} role="region" aria-label={`${sheet.title} table; scroll horizontally on smaller screens`}><table><caption>{sheet.title}</caption><thead><tr>{sheet.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead><tbody>{sheet.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => index === 0 ? <th scope="row" key={index}>{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody></table></div>
          {sheet.tip && <p className="recall-tip"><strong>Remember:</strong> {sheet.tip}</p>}<a className="recall-top" href="#top">Back to topics ↑</a>
        </section>)}
          <footer className="recall-sources"><h2>Reference sources</h2><p>For more detail, consult <a href="https://grammis.ids-mannheim.de/systematische-grammatik/373">IDS grammis on possessives</a>, <a href="https://deutsch.lingolia.com/en/grammar/declension">Lingolia on cases</a>, and <a href="https://deutsch.lingolia.com/en/grammar/adjectives/declension">Lingolia on adjective declension</a>. These sheets summarize common patterns; individual verbs, nouns and prepositions can have additional uses.</p><Link href="/grammar">Return to grammar practice →</Link></footer>
        </div>
      </div>
    </div>
  </main>;
}
