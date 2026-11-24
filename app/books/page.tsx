import { pageMetadata } from '@/app/lib/seo';
import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { TopicArt } from '@/app/components/topic-art';
import { BOOK_CATALOG } from '@/app/lib/book-catalog';

export const metadata = pageMetadata('Free German Books with Audio — A1, A2 and B1', 'Read German books at A1, A2 and B1, with audio, English translations and word meanings. Explore three free 200-page readers and save your place.', '/books');

export default function BooksPage() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-library">
    <header className="illustrated-intro"><div><h1>German books.<br /><em>Your next chapter.</em></h1><p>Three German readers. 200 pages each — about one minute per page. Read, listen, tap any word, and pick up where you left off.</p></div><TopicArt kind="learn" className="topic-art--intro" /></header>
    <div className="illustrated-bookshelf">
    {BOOK_CATALOG.map(book => <section className="book-shelf" key={book.id} aria-labelledby={`${book.level.toLowerCase()}-books-heading`}>
      <h2 id={`${book.level.toLowerCase()}-books-heading`}>{book.level}</h2>
      <Link className="book-shelf-item" href={book.path} aria-label={`Open ${book.title}`}>
        <span className={`book-cover book-cover--shelf book-cover--illustrated${book.level === 'B1' ? ' book-cover--b1' : ''}`} aria-hidden="true">
          <span className="book-cover-level">{book.level}</span>
          <TopicArt kind={book.artKind} />
          <strong lang="de">{book.title}</strong>
          <span className="book-cover-en">{book.englishTitle}</span>
          <span className="book-cover-hook">{book.hook}</span>
          <small>200 pages · Read & listen</small>
        </span>
      </Link>
    </section>)}
    </div>
  </main></div>;
}
