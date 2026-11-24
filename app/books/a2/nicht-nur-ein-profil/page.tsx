import { breadcrumbs, pageMetadata } from '@/app/lib/seo';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { StructuredData } from '@/app/components/structured-data';
import { BookResumeLink } from '@/app/components/book-bookmark-controls';
import { A2_BOOK, A2_BOOK_CHAPTERS } from '@/app/lib/a2-book-data';
import { A2_BOOK_PATH } from '@/app/lib/a2-book-info';
import { BOOK_CATALOG, bookStructuredData } from '@/app/lib/book-catalog';

const info = BOOK_CATALOG[1];

export const metadata = pageMetadata('Nicht nur ein Profil — A2 German Book', info.synopsis, A2_BOOK_PATH);

export default function A2BookContents() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--contents">
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German books', path: '/books' }, { name: A2_BOOK.title, path: A2_BOOK_PATH }])} />
    <StructuredData data={bookStructuredData(info)} />
    <Link className="reading-back" href="/books"><ArrowLeft size={17} />A2 books</Link>
    <div className="book-volume book-volume--front">
      <header className="book-cover book-cover--inside"><span className="book-cover-level">A2</span><h1 lang="de">{A2_BOOK.title}</h1></header>
      <section className="book-front-page" aria-label="Inside the book">
        <p className="book-front-kicker">{A2_BOOK.title} · {info.englishTitle}</p>
        <p className="book-description">{info.synopsis}</p>
        <p className="book-meta-line">200 pages · 10 chapters · ~1 min per page · Audio &amp; word meanings</p>
        <BookResumeLink bookId={A2_BOOK.id} path={A2_BOOK_PATH} />
        <nav className="book-chapters" aria-label="Book contents"><h2>Contents</h2><ol>{A2_BOOK_CHAPTERS.map(chapter => <li className="book-chapter-item" key={chapter.number}>
          <Link href={`${A2_BOOK_PATH}/${chapter.pages[0].number}`}><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><ArrowRight size={17} /></Link>
        </li>)}</ol></nav>
      </section>
    </div>
  </main></div>;
}
