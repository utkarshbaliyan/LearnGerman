import { getAuthenticatedUser } from '@/app/lib/supabase-auth';
import { SITE_OWNER_EMAIL } from '@/app/lib/site-owner';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' };

type TrafficRecorder = { snapshot(): unknown; history?(days: number): unknown };
const RANGES: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 };

// The team address is already public on /support; LESELAUT_OWNER_EMAILS in the
// SSM runtime config can replace it (an empty value disables the page).
function ownerEmails(value = process.env.LESELAUT_OWNER_EMAILS ?? SITE_OWNER_EMAIL) {
  return new Set(value.split(',').map(email => email.trim().toLowerCase()).filter(Boolean));
}

export async function GET(request: Request) {
  const owners = ownerEmails();
  // Not configured: behave as if the endpoint does not exist.
  if (!owners.size) return Response.json({ error: 'Not found' }, { status: 404, headers });
  const user = await getAuthenticatedUser(request);
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401, headers });
  if (!owners.has(user.email.trim().toLowerCase())) return Response.json({ error: 'Not found' }, { status: 404, headers });
  const recorder = (globalThis as { __leselautTraffic?: TrafficRecorder }).__leselautTraffic;
  if (!recorder) return Response.json({ available: false }, { headers });
  const range = new URL(request.url).searchParams.get('range');
  if (range && range in RANGES) {
    const history = recorder.history?.(RANGES[range]) ?? null;
    return Response.json(history ? { available: true, range, history } : { available: false }, { headers });
  }
  return Response.json(recorder.snapshot(), { headers });
}
