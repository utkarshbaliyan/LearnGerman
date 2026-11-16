import { getAuthenticatedUser } from '@/app/lib/supabase-auth';

export const dynamic = 'force-dynamic';
const headers = { 'cache-control': 'private, no-store', 'x-content-type-options': 'nosniff', 'x-robots-tag': 'noindex' };

type TrafficRecorder = { snapshot(): unknown };

// The team address is already public on /support; LESELAUT_OWNER_EMAILS in the
// SSM runtime config can replace it (an empty value disables the page).
const DEFAULT_OWNER = 'leselaut.team@gmail.com';

function ownerEmails(value = process.env.LESELAUT_OWNER_EMAILS ?? DEFAULT_OWNER) {
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
  return Response.json(recorder.snapshot(), { headers });
}
