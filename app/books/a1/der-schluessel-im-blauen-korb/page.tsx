import { breadcrumbs, pageMetadata } from '@/app/lib/seo';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { BookResumeLink } from '@/app/components/book-bookmark-controls';
import { A1_BOOK, BOOK_CHAPTERS } from '@/app/lib/book-data';
import { BOOK_CATALOG, bookStructuredData } from '@/app/lib/book-catalog';

const bookPath = '/books/a1/der-schluessel-im-blauen-korb';
const info = BOOK_CATALOG[0];

export const metadata = pageMetadata('Der Schlüssel im blauen Korb — A1 German Book', info.synopsis, bookPath);

export default function BookContentsPage() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--contents">
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German books', path: '/books' }, { name: A1_BOOK.title, path: bookPath }])} />
    <StructuredData data={bookStructuredData(info)} />
    <Link className="reading-back" href="/books"><ArrowLeft size={17} />A1 books</Link>
    <div className="book-volume book-volume--front">
      <header className="book-cover book-cover--inside"><span className="book-cover-level">A1</span><h1 lang="de">{A1_BOOK.title}</h1></header>
      <section className="book-front-page" aria-label="Inside the book">
        <p className="book-front-kicker">{A1_BOOK.title} · {info.englishTitle}</p>
        <p className="book-description">{info.synopsis}</p>
        <p className="book-meta-line">200 pages · 10 chapters · ~1 min per page · Audio &amp; word meanings</p>
        <BookResumeLink />
        <nav className="book-chapters" aria-label="Book contents"><h2>Contents</h2><ol>{BOOK_CHAPTERS.map(chapter => <li className="book-chapter-item" key={chapter.number}>
          <Link href={`${bookPath}/${chapter.pages[0].number}`}><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><ArrowRight size={17} /></Link>
        </li>)}</ol></nav>
      </section>
    </div>
  </main></div>;
}
