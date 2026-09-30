import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { A1_BOOK } from '@/app/lib/book-data';

const bookPath = '/books/a1/der-schluessel-im-blauen-korb';

export const metadata = { title: 'A1 Books · LeseLaut', description: 'A1 German books on LeseLaut.' };

export default function BooksPage() {
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-library">
    <h1>Books</h1>
    <section className="book-shelf" aria-labelledby="a1-books-heading">
      <h2 id="a1-books-heading">A1</h2>
      <Link className="book-shelf-item" href={bookPath} aria-label={`Open ${A1_BOOK.title}`}>
        <span className="book-cover book-cover--shelf" aria-hidden="true"><span className="book-cover-level">A1</span><strong lang="de">{A1_BOOK.title}</strong></span>
      </Link>
    </section>
  </main></div>;
}
