import { createRemoteJWKSet, jwtVerify } from "jose";

const SUPABASE_URL = "https://npnzojbbwwdtujuurkmx.supabase.co";
const ISSUER = `${SUPABASE_URL}/auth/v1`;
const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));

export type AuthenticatedUser = { id: string; email: string; displayName: string; requestedUsername: string | null };

export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) return null;
  try {
    const { payload } = await jwtVerify(authorization.slice(7), JWKS, { issuer: ISSUER, audience: "authenticated" });
    const email = typeof payload.email === "string" ? payload.email : "";
    if (!payload.sub || !email) return null;
    const metadata = payload.user_metadata && typeof payload.user_metadata === "object" ? payload.user_metadata as Record<string, unknown> : {};
    const name = [metadata.full_name, metadata.name, metadata.username].find((value): value is string => typeof value === "string" && value.trim().length > 0);
    return { id: payload.sub, email, displayName: name?.trim() ?? email.split("@")[0], requestedUsername: typeof metadata.username === "string" ? metadata.username : null };
  } catch { return null; }
}
