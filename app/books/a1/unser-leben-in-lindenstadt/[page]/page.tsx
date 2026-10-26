import { permanentRedirect } from 'next/navigation';
import { absoluteUrl } from '@/app/lib/seo';

export default async function PreviousBookPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  permanentRedirect(absoluteUrl(`/books/a1/der-schluessel-im-blauen-korb/${page}`));
}
