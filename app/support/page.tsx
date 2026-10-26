import { pageMetadata } from '@/app/lib/seo';
export const metadata = pageMetadata('LeseLaut Help and Contact', 'Get help with your LeseLaut account, saved progress and German learning materials. Contact the team or report a content problem.', '/support');
import Link from 'next/link';
import { SiteHeader } from '@/app/components/site-header';

export default function SupportPage() {
  return <main className="site-shell"><SiteHeader active="account" /><article className="information-page">
    <h1>Help with LeseLaut</h1><p>Email <a href="mailto:leselaut.team@gmail.com">leselaut.team@gmail.com</a> for account, data or learning-content problems. Include the page address, what happened and the approximate time. Leave out passwords, API keys and private learner work.</p>
    <h2>Account and progress</h2><p>Use “Forgot password?” on the <Link href="/account">account page</Link> for a recovery email. Open the link in the same browser where you requested it. Sign in to the same account on each device for synced progress. Download your data before deleting your account.</p>
    <h2>Practice limits</h2><p>The beta shares an allowance of 200 outbound AI calls per UTC day across all users. One activity can make multiple calls, including transcription and retries. Personal practice limits also apply. Reading and saved work remain available when AI practice is paused or its allowance is exhausted.</p>
    <h2>About this beta</h2><p>AI feedback and generated material can contain mistakes. Report incorrect corrections with the activity name. Practice completion and scores are not a CEFR certificate, a validated level assessment or proof of pronunciation quality. Initial learning activities still need independent teacher review and learner testing.</p>
    <p><Link href="/privacy">How your data is used</Link></p>
  </article></main>;
}
