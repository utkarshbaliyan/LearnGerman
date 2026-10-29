'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/** Local QA overlay, rendered only by a development server with the explicit flag. */
export function ResponsiveAudit() {
  const [report, setReport] = useState('Waiting for layout');
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let disposed = false;
    function collect() {
      const width = document.documentElement.clientWidth;
      const params = new URLSearchParams(location.search), safe = new URLSearchParams();
      for (const key of ['level', 'view', 'lesson', 'goal']) if (params.has(key)) safe.set(key, params.get(key)!.slice(0, 100));
      let ready = document.readyState === 'complete';
      if (location.pathname === '/vocabulary') ready = ready && (params.get('view') === 'practice' ? !!document.querySelector('.vocabulary-quiz-answers button') : !!document.querySelector('.vocab-familiar-toggle:not(:disabled)'));
      if (location.pathname === '/grammar' && params.get('lesson')) ready = ready && !!document.querySelector('.grammar-lesson-heading')?.textContent?.startsWith(params.get('lesson')!.slice(0, 2).toUpperCase());
      setContainer(document.querySelector<HTMLElement>('[role="dialog"]') ?? document.body);
      const visible = (element: Element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && !element.closest('[data-layout-audit], [aria-hidden="true"], [hidden], [inert], .sr-only') && getComputedStyle(element).visibility !== 'hidden' && getComputedStyle(element).clip === 'auto' && getComputedStyle(element).clipPath === 'none';
      };
      const name = (element: Element) => `${element.tagName.toLowerCase()}.${[...element.classList].slice(0, 2).join('.')}`;
      const offenders = [...document.body.querySelectorAll('*')].filter(element => {
        if (!visible(element)) return false;
        const box = element.getBoundingClientRect();
        if (box.left >= -1 && box.right <= width + 1) return false;
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
          if (['auto', 'scroll', 'hidden', 'clip'].includes(getComputedStyle(parent).overflowX)) return false;
          parent = parent.parentElement;
        }
        return true;
      });
      const tiny = [...document.querySelectorAll('button, select, input:not([type="radio"]):not([type="checkbox"]), [role="button"], .topnav > a')].filter(element => {
        if (!visible(element) || element.closest('.reading-prose, .grammar-scene-story, .reader-copy, .book-paragraph')) return false;
        const box = element.getBoundingClientRect();
        return box.width < 43 || box.height < 43;
      });
      const inputs = [...document.querySelectorAll('input:not([type=radio]):not([type=checkbox]), select, textarea')].filter(element => visible(element) && parseFloat(getComputedStyle(element).fontSize) < 16);
      const value = { path: location.pathname, search: safe.size ? '?' + safe.toString() : '', width, height: window.innerHeight, ready, scrollWidth: document.documentElement.scrollWidth, overflow: Math.max(0, document.documentElement.scrollWidth - width), offenders: offenders.slice(0, 4).map(name), smallControls: tiny.slice(0, 5).map(element => ({ name: element.getAttribute('aria-label') || element.textContent?.trim().slice(0, 35) || name(element), width: Math.round(element.getBoundingClientRect().width), height: Math.round(element.getBoundingClientRect().height) })), smallInputs: inputs.slice(0, 4).map(name), containers: [...document.querySelectorAll('[role=dialog], .vocabulary-table-wrap, .learning-start, .learning-session, .site-menu-panel')].filter(element => visible(element) && element.scrollWidth > element.clientWidth + 1).map(element => ({ name: name(element), overflow: element.scrollWidth - element.clientWidth })), header: Math.round(document.querySelector('.topbar')?.getBoundingClientRect().height ?? 0) };
      setReport(JSON.stringify(value));
      if (window.parent !== window) window.parent.postMessage({ type: 'leselaut-layout-audit', report: value }, location.origin);
    }
    const refresh = () => { if (disposed) return; clearTimeout(timer); timer = setTimeout(collect, 200); };
    const observer = new MutationObserver(records => { if (records.some(record => !(record.target instanceof Element && record.target.closest('[data-layout-audit]')))) refresh(); });
    observer.observe(document.body, { subtree: true, childList: true, attributes: true });
    window.addEventListener('load', refresh); window.addEventListener('resize', refresh); document.fonts.ready.then(refresh); refresh();
    return () => { disposed = true; clearTimeout(timer); observer.disconnect(); window.removeEventListener('load', refresh); window.removeEventListener('resize', refresh); };
  }, []);
  return container ? createPortal(<details data-layout-audit style={{ position: 'fixed', bottom: 4, left: 4, zIndex: 100000, maxWidth: 'min(300px, 90vw)', pointerEvents: 'none', padding: 6, color: '#fff', background: '#182b25', border: '1px solid #adc9ba', font: '11px/1.5 monospace' }} open><summary>Local responsive audit</summary><output style={{ display: 'block', maxHeight: 100, overflow: 'auto', overflowWrap: 'anywhere' }}>RESPONSIVE_AUDIT:{report}</output></details>, container) : null;
}
