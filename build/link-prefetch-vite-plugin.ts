import type { Plugin } from 'vite';

/** Vinext 0.0.50 auto-prefetches every static <Link> in the viewport via `.rsc`
 * requests without setting a `Next-Router-Prefetch` header, inflating page
 * traffic counts and adding speculative SSR work on the single EC2 host.
 * Disable automatic background prefetching so every `.rsc` request reflects an
 * actual user click.
 */
export function disableLinkAutoPrefetch(): Plugin {
  return {
    name: 'leselaut-disable-link-auto-prefetch',
    enforce: 'pre',
    transform(code, id) {
      if (!id.split('?')[0].endsWith('/vinext/dist/shims/link-prefetch.js')) return;
      const marker = /function canLinkPrefetch\(input\)\s*\{\s*return [^;]+;\s*\}/;
      if (!marker.test(code)) {
        throw new Error('Vinext link-prefetch shim changed. Review disableLinkAutoPrefetch before publishing.');
      }
      return {
        code: code.replace(marker, 'function canLinkPrefetch() {\n\treturn false;\n}'),
        map: null,
      };
    },
  };
}
