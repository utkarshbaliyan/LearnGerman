import type { AwsRumConfig } from 'aws-rum-web';

export function rumOptions(origin: string): AwsRumConfig {
  const escapedOrigin = origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return {
    allowCookies: true, cookieAttributes: { unique: true, secure: true, sameSite: 'Strict', path: '/' },
    userIdRetentionDays: 30, sessionSampleRate: 1, sessionEventLimit: 100,
    dispatchInterval: 15_000, enableXRay: false, recordResourceUrl: false, pageIdFormat: 'PATH', disableAutoPageView: true,
    pagesToExclude: [/\/(auth|account|api|active-learning)(?:[/?#]|$)/],
    telemetries: [
      ['errors', { stackTraceLength: 300, ignore: (event: ErrorEvent | PromiseRejectionEvent) => /(?:sb_secret_|sk-proj-|gsk_|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/i.test(String('message' in event ? event.message : event.reason)) }],
      ['performance', { ignore: (entry: PerformanceEntry) => entry.entryType === 'resource', recordAllTypes: [], sampleTypes: [], eventLimit: 0 }],
      ['http', { recordAllRequests: false, addXRayTraceIdHeader: false,
        urlsToInclude: [new RegExp(`^${escapedOrigin}/api/(?:progress|learning/overview|learning/material)$`)],
        urlsToExclude: [/[?#]/], stackTraceLength: 0 }],
    ],
  };
}

// The SDK includes document.referrer in page-view details when cookies are on.
// Install this public hook before the first manually recorded page view so a
// same-origin auth/referral URL can never send its query string to RUM.
export function stripRumReferrer(_type: string, details: object) {
  const clean = (value: object) => {
    const fields = value as Record<string, unknown>;
    delete fields.referrer; delete fields.referrerDomain;
    for (const [key, item] of Object.entries(fields)) {
      if (typeof item === 'string') fields[key] = item.replace(/https?:\/\/[^\s"'<>]+/g, link => {
        try { const url = new URL(link); return url.origin + url.pathname; } catch { return '[url removed]'; }
      });
      else if (item && typeof item === 'object') clean(item);
    }
  };
  clean(details);
}
