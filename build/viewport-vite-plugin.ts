import type { Plugin } from 'vite';

/** The locked Vinext serializer omits two supported Next viewport fields.
 * Extend its existing tag, rather than emitting a conflicting second viewport.
 * The production smoke test checks the actual rendered result for both fields.
 */
export function viewportCompatibility(): Plugin {
  return {
    name: 'leselaut-viewport-compatibility',
    enforce: 'pre',
    transform(code, id) {
      if (!id.split('?')[0].endsWith('/vinext/dist/shims/metadata.js') || !code.includes('ViewportHead')) return;
      const missing = [
        ['viewportFit', 'viewport-fit'],
        ['interactiveWidget', 'interactive-widget'],
      ].filter(([field]) => !code.includes(`viewport.${field}`));
      if (!missing.length) return;
      const marker = /if\s*\(\s*parts\.length\s*>\s*0\s*\)/;
      if (!marker.test(code)) throw new Error('Vinext viewport serialization changed. Review the viewport compatibility adapter before publishing.');
      const additions = missing.map(([field, attribute]) => `if (viewport.${field} !== void 0) parts.push("${attribute}=" + viewport.${field});`).join('\n');
      return { code: code.replace(marker, match => `${additions}\n${match}`), map: null };
    },
  };
}
