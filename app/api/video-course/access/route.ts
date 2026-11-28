import { getAuthenticatedUser } from '@/app/lib/supabase-auth';
import { SITE_OWNER_EMAIL } from '@/app/lib/site-owner';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' };

function ownerEmails(value = process.env.LESELAUT_OWNER_EMAILS ?? SITE_OWNER_EMAIL) {
  return new Set(value.split(',').map(email => email.trim().toLowerCase()).filter(Boolean));
}

export async function GET(request: Request) {
  const owners = ownerEmails();
  if (!owners.size) return Response.json({ allowed: false }, { status: 404, headers });
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ allowed: false }, { status: 401, headers });
  if (!owners.has(user.email.trim().toLowerCase())) return Response.json({ allowed: false }, { status: 404, headers });
  return Response.json({ allowed: true, email: user.email }, { headers });
}
