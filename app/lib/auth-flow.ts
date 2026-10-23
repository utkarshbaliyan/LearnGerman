// Preserve email links issued before the PKCE rollout. New sign-ins use PKCE;
// only the established confirmation route accepts the old token-pair callback.
export function authFlowForLocation(pathname = '', hash = ''): 'implicit' | 'pkce' {
  const parameters = new URLSearchParams(hash.replace(/^#/, ''));
  return pathname === '/auth/confirm' && parameters.get('access_token') && parameters.get('refresh_token') ? 'implicit' : 'pkce';
}
