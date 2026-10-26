import { permanentRedirect } from 'next/navigation';
import { absoluteUrl } from '@/app/lib/seo';

export default function ChapterOnePage() {
  permanentRedirect(absoluteUrl('/stories/reading-a1-01-v1'));
}
