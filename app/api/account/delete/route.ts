import { getAuthenticatedUser } from '@/app/lib/supabase-auth';
import { boundedBody } from '@/app/lib/request-body';
import { deleteAccount } from '@/app/lib/account-deletion';
import { getD1 } from '@/db';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff' };
const json = (body: unknown, status = 200) => Response.json(body, { status, headers });

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser(request, { includeDeleting: true });
    if (!user) return json({ error: 'Sign in to delete your account.' }, 401);
    const origin = request.headers.get('origin');
    const endpoint = new URL(request.url);
    // TLS terminates at CloudFront; nginx sets this header. The original Sites
    // address is a compatibility proxy to the same backend and learner database.
    if (request.headers.get('x-forwarded-proto') === 'https') endpoint.protocol = 'https:';
    const allowed = new Set([endpoint.origin, 'https://d19k6l47v6hw3.cloudfront.net', 'https://leselaut-german.professor-ut7.chatgpt.site', 'https://leselaut.com', 'https://www.leselaut.com']);
    if (origin && !allowed.has(origin)) return json({ error: 'Request origin does not match.' }, 403);
    const bytes = await boundedBody(request, 1024);
    if (!bytes) return json({ error: 'Invalid deletion request.' }, 413);
    let body;
    try { body = JSON.parse(new TextDecoder().decode(bytes)); } catch { return json({ error: 'Invalid deletion request.' }, 400); }
    if (body?.confirmation !== 'DELETE' || body?.email !== user.email) return json({ error: 'Enter DELETE and your account email to confirm.' }, 400);
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!secret) return json({ error: 'Automatic deletion is not configured yet. Contact leselaut.team@gmail.com to arrange deletion.' }, 503);
    const db = await getD1();
    const existing = await db.prepare('SELECT status FROM account_deletions WHERE user_id = ?').bind(user.id).first();
    const age = Date.now() / 1000 - (user.authenticatedAt ?? 0);
    if (!existing && (age < -60 || age > 600)) return json({ error: 'Sign out and sign in again, then delete your account within ten minutes.' }, 403);
    const status = await deleteAccount(db, user.id, secret);
    return json({ status }, status === 'complete' ? 200 : 202);
  } catch {
    console.error('{"event":"account_deletion_failed"}');
    return json({ error: 'Deletion could not be confirmed. Retry or contact leselaut.team@gmail.com.' }, 503);
  }
}
