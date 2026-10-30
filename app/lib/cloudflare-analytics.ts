import configuration from '@/deploy/cloudflare/analytics-public.json';
import { observedPage, readAnalyticsConsent, readRumConsent, type RumConsent } from './rum-privacy';

export const CLOUDFLARE_CONSENT_KEY = 'leselaut:cloudflare-analytics-choice:v1';
export const CLOUDFLARE_SCRIPT_ID = 'leselaut-cloudflare-beacon';
export function cloudflareAvailable(hostname: string) {
  return configuration.enabled && /^[a-f0-9]{32}$/.test(configuration.token) && configuration.hosts.includes(hostname);
}
export function readCloudflareConsent(storage: Pick<Storage, 'getItem'>, now = Date.now()): RumConsent {
  // An old provider's opt-in is not consent to a new provider. Keep existing opt-outs.
  return readAnalyticsConsent(storage, CLOUDFLARE_CONSENT_KEY, now)
    ?? (readRumConsent(storage, now) === 'decline' ? 'decline' : null);
}
export function loadCloudflare(doc: Document = document) {
  const boundary = doc.getElementById('leselaut-analytics-boundary');
  // Fail closed if the early navigation/privacy guard did not load.
  if (boundary?.dataset.analyticsReady !== '1' || boundary.dataset.analyticsNavigating === '1' || doc.getElementById(CLOUDFLARE_SCRIPT_ID)) return;
  // An already-open page from before this release can still send a private
  // same-origin referrer under its old policy. Do not pass it to the SDK.
  if (doc.referrer) {
    try { const referrer = new URL(doc.referrer); if (referrer.origin === doc.location.origin && !observedPage(referrer.pathname)) return; }
    catch { return; }
  }
  const script = doc.createElement('script');
  script.id = CLOUDFLARE_SCRIPT_ID;
  script.async = true;
  script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  script.referrerPolicy = 'strict-origin';
  script.dataset.cfBeacon = JSON.stringify({ token: configuration.token, spa: true });
  // Older browsers use a History API wrapper. Keep our private-route guard outside it.
  script.onload = () => doc.dispatchEvent(new Event('leselaut:analytics-loaded'));
  script.onerror = () => script.remove();
  doc.head.appendChild(script);
}
export function stopCloudflare(doc: Document = document, reload = true) {
  // Removing an executed script does not remove its listeners. Block its network
  // requests before reloading into the saved opt-out, without clearing app storage.
  if (doc.getElementById(CLOUDFLARE_SCRIPT_ID)) doc.dispatchEvent(new CustomEvent('leselaut:analytics-stop', { detail: { reload } }));
}
