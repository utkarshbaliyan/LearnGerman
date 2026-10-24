// The generator aligns spoken whitespace tokens, including numbers. Keep this
// independent of the smaller word fragments used by translation tooltips.
export function narrationTokens(text: string) {
  let wordIndex = 0;
  return text.split('\n\n').map(paragraph => paragraph.split(/(\s+)/).filter(Boolean).map(text => ({
    text,
    wordIndex: /[A-Za-zÄÖÜäöüßÉé0-9]/.test(text) ? wordIndex++ : null,
  })));
}

export function spokenWordAt(starts: number[], time: number, duration: number) {
  if (!Number.isFinite(time) || time < 0 || time >= duration) return -1;
  let low = 0, high = starts.length - 1, result = -1;
  while (low <= high) {
    const middle = (low + high) >>> 1;
    if (starts[middle] <= time) { result = middle; low = middle + 1; }
    else high = middle - 1;
  }
  return result;
}

export type NarrationAsset = { src: string; compatibleSrc?: string; timingSrc: string; textHash: string; wordCount: number; duration: number };
export type NarrationTiming = { textHash: string; starts: number[]; duration: number };

export function validNarrationTiming(value: unknown, asset: NarrationAsset): value is NarrationTiming {
  if (!value || typeof value !== 'object') return false;
  const timing = value as NarrationTiming;
  return timing.textHash === asset.textHash && timing.duration === asset.duration &&
    Number.isFinite(timing.duration) && timing.duration > 0 && Array.isArray(timing.starts) &&
    timing.starts.length === asset.wordCount && timing.starts.every((start, index) =>
      Number.isFinite(start) && start >= 0 && start < timing.duration && (index === 0 || start > timing.starts[index - 1]));
}

// Audio timing changes only two classes. Rebuilding every word and tooltip on
// each spoken word makes long passages expensive on phones.
export function createNarrationHighlighter() {
  let root: HTMLElement | null = null;
  let active: HTMLElement | null = null;
  let word = -1;
  const apply = () => {
    active?.classList.remove('reading-spoken-word');
    active = root && Number.isInteger(word) && word >= 0 ? root.querySelector<HTMLElement>(`[data-reading-word="${word}"]`) : null;
    active?.classList.add('reading-spoken-word');
  };
  return {
    registerText(element: HTMLElement | null) { if (root !== element) { root = element; apply(); } },
    setActiveWord(next: number) { if (next !== word) { word = next; apply(); } },
  };
}
