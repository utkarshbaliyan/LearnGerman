import { bookPageMetadata, breadcrumbs } from '@/app/lib/seo';
import { StructuredData } from '@/app/components/structured-data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookPageReader } from '@/app/components/book-page-reader';
import { BookBookmarkButton, BookPageNavigation } from '@/app/components/book-bookmark-controls';
import { A1_BOOK, getBookPage } from '@/app/lib/book-data';

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const number = Number((await params).page);
  const page = getBookPage(number);
  return bookPageMetadata(A1_BOOK.title, 'A1', '/books/a1/der-schluessel-im-blauen-korb', page);
}

export default async function BookPage({ params }: { params: Promise<{ page: string }> }) {
  const raw = (await params).page;
  if (!/^[1-9]\d*$/.test(raw)) notFound();
  const page = getBookPage(Number(raw));
  if (!page) notFound();
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--page" key={page.number}>
    <Link className="reading-back" href="/books/a1/der-schluessel-im-blauen-korb"><ArrowLeft size={17} />{A1_BOOK.title} · Contents</Link>
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German books', path: '/books' }, { name: A1_BOOK.title, path: '/books/a1/der-schluessel-im-blauen-korb' }, { name: `Page ${page.number}`, path: `/books/a1/der-schluessel-im-blauen-korb/${page.number}` }])} />
    <article className="book-volume book-volume--page">
      <header className="book-page-header"><span className="book-page-running-title" lang="de">{A1_BOOK.title}</span><span className="reading-eyebrow">Chapter {page.chapter} · {page.chapterTitle}</span><h1 lang="de">{page.title}</h1><p>Page {page.number} of 200</p><progress value={page.number} max={200} aria-label={`Page ${page.number} of 200`} /><BookBookmarkButton page={page.number} /></header>
      <BookPageReader paragraphs={page.paragraphs} translations={page.translations} glosses={page.glosses} audio={page.audio} source={{ kind: 'book', id: A1_BOOK.id, title: `${A1_BOOK.title} · Page ${page.number}`, href: `/books/a1/der-schluessel-im-blauen-korb/${page.number}`, level: 'A1' }} />
      <BookPageNavigation page={page.number} />
      <p className="book-leaf-number" aria-hidden="true">{page.number}</p>
    </article>
  </main></div>;
}
