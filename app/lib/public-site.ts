export const PUBLIC_SITE_ORIGIN = typeof window === 'undefined'
  ? "https://leselaut.com" : window.location.origin;
export const AUTH_CONFIRM_URL = `${PUBLIC_SITE_ORIGIN}/auth/confirm`;
