'use client';
import { useEffect, useRef, useState } from 'react';

type Turnstile = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global { interface Window { turnstile?: Turnstile } }

let scriptReady: Promise<Turnstile> | undefined;
function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  return scriptReady ??= new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script');
    const timeout = window.setTimeout(() => fail(), 15000);
    function fail() { window.clearTimeout(timeout); script.remove(); scriptReady = undefined; reject(new Error('Security check could not load.')); }
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true; script.defer = true;
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timeout);
      if (window.turnstile) resolve(window.turnstile); else fail();
    };
    document.head.appendChild(script);
  });
}

export function AuthCaptcha({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false, widget: string | undefined, api: Turnstile | undefined;
    onToken('');
    void loadTurnstile().then(turnstile => {
      if (cancelled || !container.current) return;
      api = turnstile;
      widget = api.render(container.current, {
        sitekey: siteKey, theme: 'auto', size: 'flexible', 'response-field': false,
        callback: (token: string) => { onToken(token); setError(''); },
        'expired-callback': () => { onToken(''); },
        'timeout-callback': () => { onToken(''); setError('Security check expired. Please retry.'); },
        'error-callback': () => { onToken(''); setError('Security check failed. Please retry.'); },
      });
    }).catch(() => { if (!cancelled) setError('Security check could not load. Check your connection and retry.'); });
    return () => { cancelled = true; onToken(''); if (widget !== undefined) api?.remove(widget); };
  }, [siteKey, attempt, onToken]);
  return <div className="account-captcha">
    <div ref={container} aria-label="Security check" />
    {error && <p role="alert">{error} <button type="button" onClick={() => { setError(''); setAttempt(value => value + 1); }}>Retry security check</button></p>}
  </div>;
}
