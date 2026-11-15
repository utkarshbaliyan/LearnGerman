import { pageMetadata } from '@/app/lib/seo';
export const metadata = pageMetadata('LeseLaut Help and Contact', 'Get help with your LeseLaut account, saved progress and German learning materials. Contact the team or report a content problem.', '/support');
import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';
import { ACTIVE_LEARNING_ENABLED } from '@/app/lib/feature-availability';

export default function SupportPage() {
  return <main className="site-shell"><SiteHeader active="account" /><article className="information-page">
    <h1>Help with LeseLaut</h1><p>Email <a href="mailto:leselaut.team@gmail.com">leselaut.team@gmail.com</a> for account, data or learning-content problems. Include the page address, what happened and the approximate time. Leave out passwords, API keys and private learner work.</p>
    <h2>Account and progress</h2><p>Use “Forgot password?” on the <Link href="/account">account page</Link> for a recovery email. Open the link in the same browser where you requested it. Sign in to the same account on each device for synced progress. Download your data before deleting your account.</p>
    {ACTIVE_LEARNING_ENABLED && <><h2>Practice limits</h2><p>Writing and speaking checks have a shared daily limit during the beta. If it runs out, reading and your saved work still work as normal.</p></>}
    <h2>About this beta</h2><p>Some stories, translations and narration were made with AI help, so mistakes can slip through. If something looks wrong, email us with the page address and we will fix it. Scores and streaks track your practice; they are not an official level certificate.</p>
    <p><Link href="/privacy">How your data is used</Link></p>
  </article></main>;
}
