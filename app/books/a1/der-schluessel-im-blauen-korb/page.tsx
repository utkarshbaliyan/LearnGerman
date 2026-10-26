import { pageMetadata } from '@/app/lib/seo';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookResumeLink } from '@/app/components/book-bookmark-controls';
import { A1_BOOK, BOOK_CHAPTERS } from '@/app/lib/book-data';

const bookPath = '/books/a1/der-schluessel-im-blauen-korb';

export const metadata = pageMetadata('Der Schlüssel im blauen Korb — A1 German Book', 'Read a free 200-page A1 German book with audio, English translations and word meanings. Follow a continuing story one short page at a time.', '/books/a1/der-schluessel-im-blauen-korb');

export default function BookContentsPage() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--contents">
    <Link className="reading-back" href="/books"><ArrowLeft size={17} />A1 books</Link>
    <div className="book-volume book-volume--front">
      <header className="book-cover book-cover--inside"><span className="book-cover-level">A1</span><h1 lang="de">{A1_BOOK.title}</h1></header>
      <section className="book-front-page" aria-label="Inside the book">
        <p className="book-front-kicker">{A1_BOOK.title}</p>
        <p className="book-description">Read a free 200-page A1 German book with audio, English translations and word meanings. Follow a continuing story one short page at a time.</p>
        <BookResumeLink />
        <nav className="book-chapters" aria-label="Book contents"><h2>Contents</h2><ol>{BOOK_CHAPTERS.map(chapter => <li className="book-chapter-item" key={chapter.number}>
          <Link href={`${bookPath}/${chapter.pages[0].number}`}><span>Chapter {chapter.number}</span><strong lang="de">{chapter.title}</strong><ArrowRight size={17} /></Link>
        </li>)}</ol></nav>
      </section>
    </div>
  </main></div>;
}
