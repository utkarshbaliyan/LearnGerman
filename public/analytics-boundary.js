/* Public/private page boundaries use document navigation so Cloudflare's SDK
 * cannot observe account/auth/AI pages. No transport monkey-patching or user IDs. */
(() => {
  const script = document.currentScript;
  if (!script || !(script.dataset.analyticsHosts || '').split(',').includes(location.hostname)) return;
  const pattern = new RegExp(script.dataset.analyticsPublicPattern);
  const publicPage = path => path.length <= 200 && pattern.test(path);
  const initialPublic = publicPage(location.pathname);
  const guarded = new WeakSet();
  let blocked = false;
  function blockCollection() {
    if (blocked) return;
    blocked = true;
    script.dataset.analyticsNavigating = '1';
    const policy = document.createElement('meta');
    policy.httpEquiv = 'Content-Security-Policy';
    // Retain every existing app connection destination; remove only analytics.
    policy.content = script.dataset.analyticsStopPolicy;
    document.head.appendChild(policy);
  }
  function crossing(value) {
    try {
      const next = new URL(value, location.href);
      return next.origin === location.origin && publicPage(next.pathname) !== publicPage(location.pathname) ? next : null;
    } catch { return null; }
  }
  function navigate(next, replace = false) {
    blockCollection();
    if (replace) location.replace(next.href); else location.assign(next.href);
  }
  function guardHistory() {
    for (const method of ['pushState', 'replaceState']) {
      const original = history[method];
      if (guarded.has(original)) continue;
      const guard = function (state, title, value) {
        const next = value == null ? null : crossing(value);
        if (next) return navigate(next, method === 'replaceState');
        return original.apply(this, arguments);
      };
      guarded.add(guard);
      history[method] = guard;
    }
  }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target?.closest?.('a[href]');
    if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const next = crossing(link.href);
    if (next) { event.preventDefault(); event.stopImmediatePropagation(); navigate(next); }
  }, true);
  // Register before the SDK, including browsers that implement the Navigation API.
  window.navigation?.addEventListener('navigate', event => {
    const next = crossing(event.destination.url);
    if (!next) return;
    blockCollection();
    if (event.destination.sameDocument) {
      if (event.cancelable) event.preventDefault();
      event.stopImmediatePropagation();
      navigate(next, true);
    }
  }, true);
  window.addEventListener('popstate', event => {
    if (publicPage(location.pathname) === initialPublic) return;
    blockCollection(); event.stopImmediatePropagation(); location.reload();
  }, true);
  document.addEventListener('leselaut:analytics-loaded', guardHistory);
  document.addEventListener('leselaut:analytics-stop', event => { blockCollection(); if (event.detail?.reload !== false) location.reload(); });
  guardHistory();
  script.dataset.analyticsReady = '1';
})();
