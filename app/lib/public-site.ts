export const PUBLIC_SITE_ORIGIN = typeof window === 'undefined'
  ? "https://leselaut-german.professor-ut7.chatgpt.site" : window.location.origin;
export const AUTH_CONFIRM_URL = `${PUBLIC_SITE_ORIGIN}/auth/confirm`;
