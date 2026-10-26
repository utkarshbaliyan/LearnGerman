export const RUM_CONSENT_KEY = 'leselaut:analytics-choice:v1';
export type RumConsent = 'allow' | 'decline' | null;
export function readRumConsent(storage: Pick<Storage, 'getItem'>, now = Date.now()): RumConsent {
  try {
    const data = JSON.parse(storage.getItem(RUM_CONSENT_KEY) ?? 'null');
    return data && ['allow', 'decline'].includes(data.choice) && Number.isFinite(data.at) && data.at <= now && now - data.at < 180 * 86400_000 ? data.choice : null;
  } catch { return null; }
}
export function observedPage(path: string) {
  return path.length <= 200 && /^(?:\/|\/(?:stories|books|grammar|vocabulary)(?:\/[a-zA-Z0-9_-]+)*|\/(?:privacy|support))$/.test(path);
}
export function privacyRestricted(browser: { doNotTrack?: string | null; globalPrivacyControl?: boolean }) {
  return browser.doNotTrack === '1' || browser.globalPrivacyControl === true;
}
export function shouldMonitor(enabled: boolean, choice: RumConsent, restricted: boolean, path: string) {
  return enabled && choice === 'allow' && !restricted && observedPage(path);
}
export function clearRumStorage(storage: Pick<Storage, 'removeItem'>, expireCookie: (name: string) => void, monitorId: string) {
  if (!/^[a-f0-9-]{36}$/.test(monitorId)) return;
  for (const name of ['cwr_s', 'cwr_u']) expireCookie(`${name}_${monitorId}`);
  for (const name of ['cwr_c', 'cwr_i']) storage.removeItem(`${name}_${monitorId}`);
}
