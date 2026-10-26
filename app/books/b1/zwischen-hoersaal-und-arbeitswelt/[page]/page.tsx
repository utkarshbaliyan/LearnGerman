import { bookPageMetadata, breadcrumbs } from '@/app/lib/seo';
import { StructuredData } from '@/app/components/structured-data';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { SiteHeader } from '@/app/components/site-header';
import { BookPageReader } from '@/app/components/book-page-reader';
import { BookBookmarkButton, BookPageNavigation } from '@/app/components/book-bookmark-controls';
import { B1_BOOK, getB1BookPage } from '@/app/lib/b1-book-data';
import { B1_BOOK_PATH } from '@/app/lib/b1-book-info';

export async function generateMetadata({ params }: { params: Promise<{ page: string }> }) {
  const number = Number((await params).page), page = getB1BookPage(number);
  return bookPageMetadata(B1_BOOK.title, 'B1', '/books/b1/zwischen-hoersaal-und-arbeitswelt', page);
}

export default async function B1BookPage({ params }: { params: Promise<{ page: string }> }) {
  const raw = (await params).page;
  if (!/^[1-9]\d*$/.test(raw)) notFound();
  const page = getB1BookPage(Number(raw));
  if (!page) notFound();
  return <div className="site-shell"><SiteHeader active="books" /><main className="book-reader book-reader--page" key={page.number}>
    <Link className="reading-back" href={B1_BOOK_PATH}><ArrowLeft size={17} />{B1_BOOK.title} · Contents</Link>
    <StructuredData data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'German books', path: '/books' }, { name: B1_BOOK.title, path: '/books/b1/zwischen-hoersaal-und-arbeitswelt' }, { name: `Page ${page.number}`, path: `/books/b1/zwischen-hoersaal-und-arbeitswelt/${page.number}` }])} />
    <article className="book-volume book-volume--page">
      <header className="book-page-header"><span className="book-page-running-title" lang="de">{B1_BOOK.title}</span><span className="reading-eyebrow">Chapter {page.chapter} · {page.chapterTitle}</span><h1 lang="de">{page.title}</h1><p>Page {page.number} of 200</p><progress value={page.number} max={200} aria-label={`Page ${page.number} of 200`} /><BookBookmarkButton page={page.number} bookId={B1_BOOK.id} /></header>
      <BookPageReader paragraphs={page.paragraphs} translations={page.translations} glosses={page.glosses} audio={page.audio} source={{ kind: 'book', id: B1_BOOK.id, title: `${B1_BOOK.title} · Page ${page.number}`, href: `${B1_BOOK_PATH}/${page.number}`, level: 'B1' }} />
      <BookPageNavigation page={page.number} bookId={B1_BOOK.id} path={B1_BOOK_PATH} />
      <p className="book-leaf-number" aria-hidden="true">{page.number}</p>
    </article>
  </main></div>;
}
