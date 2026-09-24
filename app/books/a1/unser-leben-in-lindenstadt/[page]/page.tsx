import { redirect } from 'next/navigation';

export default async function PreviousBookPage({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  redirect(`/books/a1/der-schluessel-im-blauen-korb/${page}`);
}
