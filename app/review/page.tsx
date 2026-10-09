import { SiteHeader } from '@/app/components/site-header';
import { PersonalReview } from '@/app/components/personal-review';
export const metadata = { title: 'Personal review · LeseLaut', description: 'Review saved story words and practise past mistakes in fresh German situations.' };
export default function ReviewPage() { return <div className="site-shell"><SiteHeader active="review" /><PersonalReview /></div>; }
