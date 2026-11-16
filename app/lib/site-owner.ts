// Public team address (also shown on /support). The server still checks the
// signed-in Supabase email before returning any live traffic data.
export const SITE_OWNER_EMAIL = 'leselaut.team@gmail.com';

export function isSiteOwnerEmail(email: string | null | undefined, owners: Iterable<string> = [SITE_OWNER_EMAIL]) {
  const value = email?.trim().toLowerCase();
  if (!value) return false;
  for (const owner of owners) if (owner.trim().toLowerCase() === value) return true;
  return false;
}
