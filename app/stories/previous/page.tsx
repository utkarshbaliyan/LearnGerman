import { permanentRedirect } from 'next/navigation';
import { absoluteUrl } from '@/app/lib/seo';

export default function PreviousStories() {
  permanentRedirect(absoluteUrl('/stories'));
}
