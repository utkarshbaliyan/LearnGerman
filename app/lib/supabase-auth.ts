import { createRemoteJWKSet, jwtVerify } from "jose";
import { getD1 } from '@/db';

const SUPABASE_URL = "https://npnzojbbwwdtujuurkmx.supabase.co";
const ISSUER = `${SUPABASE_URL}/auth/v1`;
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

export type AuthenticatedUser = { id: string; email: string; displayName: string; requestedUsername: string | null; authenticatedAt?: number };

export async function getAuthenticatedUser(request: Request, options: { includeDeleting?: boolean } = {}): Promise<AuthenticatedUser | null> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ") || authorization.length > 16_384) return null;
  try {
    const { payload } = await jwtVerify(authorization.slice(7), JWKS, { issuer: ISSUER, audience: "authenticated", requiredClaims: ['sub', 'exp'] });
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!payload.sub || !email.trim() || payload.role !== 'authenticated') return null;
    if (!options.includeDeleting && await (await getD1()).prepare('SELECT 1 AS deleting FROM account_deletions WHERE user_id = ?').bind(payload.sub).first()) return null;
    const metadata = payload.user_metadata && typeof payload.user_metadata === "object" ? payload.user_metadata as Record<string, unknown> : {};
    const name = [metadata.full_name, metadata.name, metadata.username].find((value): value is string => typeof value === "string" && value.trim().length > 0);
    const authentications = Array.isArray(payload.amr) ? payload.amr : [];
    const authenticatedAt = Math.max(0, ...authentications.flatMap((value: unknown) => {
      if (!value || typeof value !== 'object') return [];
      const entry = value as { method?: unknown; timestamp?: unknown };
      return ['password', 'oauth', 'otp', 'recovery', 'sso/saml'].includes(String(entry.method)) && typeof entry.timestamp === 'number' && Number.isFinite(entry.timestamp) ? [entry.timestamp] : [];
    }));
    return { id: payload.sub, email, displayName: (name?.trim() ?? email.split("@")[0]).slice(0, 120), requestedUsername: typeof metadata.username === "string" ? metadata.username : null, authenticatedAt };
  } catch { return null; }
}
