'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { useBookBookmark } from '@/app/hooks/use-book-bookmark';
import { BOOK_PAGE_COUNT } from '@/app/lib/book-bookmark';

const bookPath = '/books/a1/der-schluessel-im-blauen-korb';

export function BookResumeLink() {
  const { bookmark } = useBookBookmark();
  return <Link className="reading-primary" href={`${bookPath}/${bookmark?.page ?? 1}`}>
    {bookmark ? `Continue reading · Page ${bookmark.page}` : 'Start reading'} <ArrowRight size={18} />
  </Link>;
}

export function BookBookmarkButton({ page }: { page: number }) {
  const { bookmark, savePage } = useBookBookmark();
  const saved = bookmark?.page === page;
  return <button type="button" className="book-bookmark-button" aria-pressed={saved} onClick={() => savePage(page)}>
    {saved ? <BookmarkCheck size={18} aria-hidden="true" /> : <Bookmark size={18} aria-hidden="true" />}
    {saved ? 'Page bookmarked' : 'Bookmark this page'}
  </button>;
}

export function BookPageNavigation({ page }: { page: number }) {
  const { savePage } = useBookBookmark();
  return <nav className="book-page-navigation" aria-label="Book pages">
    {page > 1 ? <Link href={`${bookPath}/${page - 1}`} onClick={() => savePage(page - 1)}><ArrowLeft size={17} />Previous page</Link> : <span />}
    <Link href="/books">Contents</Link>
    {page < BOOK_PAGE_COUNT ? <Link className="reading-primary" href={`${bookPath}/${page + 1}`} onClick={() => savePage(page + 1)}>Next page <ArrowRight size={17} /></Link>
      : <Link className="reading-primary" href="/books">Finish book <ArrowRight size={17} /></Link>}
  </nav>;
}
