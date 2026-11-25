'use client';
import { useRef, useState } from 'react';
import { CheckCircle2, ChevronLeft, ChevronRight, Clapperboard, LayoutList, RotateCcw, Sparkles, XCircle } from 'lucide-react';
import type { ExerciseItem, ExerciseSection } from '@/app/video-course/types';
import { recordAnswers, saveBlock } from '@/app/video-course/progress';
import { seekVideo } from '@/app/video-course/video-embed';
import { AudioButton, SpeakTask, WriteTask, writeResult } from '@/app/video-course/tasks';
import { ChatTask, MatchTask, ReadingCard, SortTask, parseJsonMap } from '@/app/video-course/interactive-tasks';

export const PASS = 0.8;
const norm = (s: string) => s.normalize('NFC').toLowerCase().replace(/[.,!?;:"“”„'’…-]/g, '').replace(/\s+/g, ' ').trim();
const strict = (s: string) => s.normalize('NFC').replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim();
const list = (a: string | string[]) => (Array.isArray(a) ? a : [a]);
type Get = (suffix?: string) => string;

function isCorrect(item: ExerciseItem, get: Get): boolean | null {
  switch (item.type) {
    case 'choice': return get() === item.answer;
    case 'gap': case 'type': return list(item.answer).some(a => norm(a) === norm(get()));
    case 'fix': return list(item.answer).some(a => strict(a) === strict(get())); // capitals matter in German
    case 'order': return norm(get()) === norm(item.answer);
    case 'match': {
      const m = parseJsonMap(get());
      return item.pairs.every(([l, r]) => m[l] === r);
    }
    case 'sort': {
      const p = parseJsonMap(get());
      return item.cards.every(c => p[c.text] === c.bucket);
    }
    case 'chat': {
      const p = parseJsonMap(get());
      return item.turns.every((t, i) => !t.reply || p[String(i)] === t.reply.answer);
    }
    case 'form': return item.fields.every((f, i) => norm(f.answer) === norm(get(`.${i}`)));
    case 'write': return writeResult(item, get()).ok;
    case 'speak': return null; // ungraded: done when recorded
  }
}
const solution = (item: ExerciseItem) => {
  switch (item.type) {
    case 'gap': case 'type': case 'fix': return list(item.answer).join(' / ');
    case 'form': return item.fields.map(f => `${f.label}: ${f.answer}`).join(' · ');
    case 'choice': case 'order': return item.answer;
    case 'match': return item.pairs.map(([l, r]) => `${l} = ${r}`).join(' · ');
    case 'sort': return 'Check the highlighted corrections in the buckets above.';
    case 'chat': return 'Check the suggested replies above.';
    default: return '';
  }
};

export function ExerciseSet({ episode, block, sections, ids }: { episode: number; block: string; sections: ExerciseSection[]; ids?: string[][] }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [step, setStep] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const lastInput = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const set = (key: string, value: string) => setAnswers(a => ({ ...a, [key]: value }));
  const getter = (key: string, src = answers): Get => (suffix = '') => src[key + suffix] ?? '';
  const keyOf = (s: ExerciseSection, i: number) => `${s.id}-${i}`;
  const idOf = (si: number, s: ExerciseSection, i: number) => ids?.[si]?.[i] ?? `${block}.${s.id}.${i}`;

  const indexed = sections.map((s, si) => ({ s, si }));
  const coreSections = indexed.filter(x => !x.s.bonus);
  const bonusSections = indexed.filter(x => !!x.s.bonus);
  const useStepper = block !== 'review' && coreSections.length > 1;
  const activeStep = Math.min(step, Math.max(0, coreSections.length - 1));

  // Score tracks core sections so optional bonus sets never block passing a step.
  const graded = coreSections.flatMap(({ s }) => s.items.map((item, i) => ({ s, item, i }))).filter(x => x.item.type !== 'speak');
  const total = graded.length;
  const scoreOf = (src: Record<string, string>, onlyChecked: boolean) => graded.filter(({ s, item, i }) => (!onlyChecked || checked[s.id]) && isCorrect(item, getter(keyOf(s, i), src))).length;
  const allChecked = coreSections.every(({ s }) => checked[s.id]);
  const score = scoreOf(answers, true);

  function check(si: number) {
    const s = sections[si], next = { ...checked, [s.id]: true };
    setChecked(next);
    recordAnswers(episode, s.items.map((item, i) => ({ id: idOf(si, s, i), item, correct: isCorrect(item, getter(keyOf(s, i))) !== false }))
      .filter(r => !['write', 'speak'].includes((r.item as ExerciseItem).type)), block);
    if (block !== 'review' && coreSections.every(({ s: x }) => next[x.id]) && total) saveBlock(episode, block, scoreOf(answers, false), total);
  }
  function reset(id: string) {
    setChecked(c => ({ ...c, [id]: false }));
    setAnswers(a => Object.fromEntries(Object.entries(a).filter(([k]) => !k.startsWith(`${id}-`))));
  }
  function insert(ch: string) {
    const el = lastInput.current; if (!el) return;
    const key = el.dataset.key!, v = answers[key] ?? '', start = el.selectionStart ?? v.length, end = el.selectionEnd ?? v.length;
    set(key, v.slice(0, start) + ch + v.slice(end));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(start + 1, start + 1); });
  }
  const focusProps = (key: string) => ({ 'data-key': key, onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { lastInput.current = e.currentTarget; } });

  function renderSection(section: ExerciseSection, si: number, coreIdx?: number) {
    const done = !!checked[section.id];
    const gradedHere = section.items.filter(it => it.type !== 'speak');
    const right = section.items.filter((it, i) => it.type !== 'speak' && isCorrect(it, getter(keyOf(section, i)))).length;
    const typed = section.items.some(it => ['gap', 'fix', 'type', 'form', 'write'].includes(it.type));
    const singleRich = section.items.length === 1 && ['match', 'sort', 'chat', 'write', 'form'].includes(section.items[0].type);
    const hasNextCore = useStepper && !showAll && coreIdx !== undefined && coreIdx + 1 < coreSections.length;

    return <section key={section.id} className={`vc-section ${section.bonus ? 'is-bonus' : ''}`}>
      <header>
        <div className="vc-sec-title-row">
          <h3>{section.title}</h3>
          {coreIdx !== undefined && useStepper && <span className="vc-sec-count">Set {coreIdx + 1} of {coreSections.length}</span>}
          {section.bonus && <span className="vc-sec-bonus-tag"><Sparkles aria-hidden="true" /> Extra</span>}
        </div>
        <p>{section.instructions}</p>
      </header>
      {section.text && <ReadingCard text={section.text} />}
      {typed && <div className="vc-keys" aria-label="Insert special characters">{['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map(ch => <button key={ch} type="button" onMouseDown={e => e.preventDefault()} onClick={() => insert(ch)}>{ch}</button>)}</div>}
      <ol className={singleRich ? 'vc-list-plain' : undefined}>
        {section.items.map((item, i) => {
          const key = keyOf(section, i), get = getter(key), value = get(), result = done ? isCorrect(item, get) : null;
          const state = result === true ? 'is-right' : result === false ? 'is-wrong' : '';
          const input = (label: string, wide = false) => <input {...focusProps(key)} className={wide ? 'vc-input-wide' : ''} value={value} disabled={done} aria-label={label}
            autoCapitalize="off" autoCorrect="off" spellCheck={false} onChange={e => set(key, e.target.value)} />;
          return <li key={key} className={`vc-item vc-item-${item.type} ${state}`}>
            {item.image && <img className="vc-face" src={`/video-course/img/${item.image}.webp`} alt="" width={52} height={103} loading="lazy" />}
            {item.audio && item.type !== 'speak' && <AudioButton line={item.audio} />}
            {item.type === 'choice' && <>{item.prompt && <span className="vc-prompt">{item.prompt}{done && item.note && <em className="vc-hint"> = {item.note}</em>}</span>}<div className="vc-options" role="radiogroup">
              {item.options.map(opt => <button key={opt} type="button" role="radio" aria-checked={value === opt} disabled={done}
                className={`${value === opt ? 'is-picked' : ''} ${done && opt === item.answer ? 'is-answer' : ''}`} onClick={() => set(key, opt)}>{opt}</button>)}
            </div></>}
            {item.type === 'gap' && <span className="vc-prompt" lang="de">{item.before} {input('Missing word')} {item.after}{item.hint && <em className="vc-hint">({item.hint})</em>}</span>}
            {item.type === 'type' && <>{item.prompt ? <span className="vc-prompt">{item.prompt}</span> : <span className="vc-prompt">Type what you hear:</span>}{input(item.prompt || 'What you hear', true)}</>}
            {item.type === 'fix' && <><span className="vc-prompt vc-wrong" lang="de">{item.wrong}</span>{input(`Correct: ${item.wrong}`, true)}</>}
            {item.type === 'order' && <OrderTask tokens={item.tokens} value={value} disabled={done} onChange={v => set(key, v)} en={item.en} />}
            {item.type === 'match' && <MatchTask item={item} value={value} disabled={done} onChange={v => set(key, v)} />}
            {item.type === 'sort' && <SortTask item={item} value={value} disabled={done} onChange={v => set(key, v)} />}
            {item.type === 'chat' && <ChatTask item={item} value={value} disabled={done} onChange={v => set(key, v)} />}
            {item.type === 'form' && <fieldset className="vc-form"><legend>{item.prompt}</legend>{item.fields.map((f, fi) => <label key={f.label}><span>{f.label}</span>
              <input {...focusProps(`${key}.${fi}`)} value={get(`.${fi}`)} disabled={done} autoCapitalize="words" onChange={e => set(`${key}.${fi}`, e.target.value)} /></label>)}</fieldset>}
            {item.type === 'write' && <WriteTask item={item} value={value} disabled={done} onChange={v => set(key, v)} inputProps={focusProps(key)} />}
            {item.type === 'speak' && <SpeakTask item={item} onDone={() => set(key, 'done')} />}
            {result === true && <CheckCircle2 className="vc-mark" aria-label="Correct" />}
            {result === false && <span className="vc-solution"><XCircle className="vc-mark" aria-label="Wrong" />{!['write', 'choice'].includes(item.type) && <span lang="de">{solution(item)}</span>}
              {(item.at ?? section.at) && <button type="button" className="vc-rewatch" onClick={() => seekVideo((item.at ?? section.at)!)}><Clapperboard aria-hidden="true" /> Rewatch {item.at ?? section.at}</button>}</span>}
          </li>;
        })}
      </ol>
      <footer>
        {done ? <>
          {gradedHere.length > 0 && <strong>{right} / {gradedHere.length}</strong>}
          <button type="button" className="vc-btn-ghost" onClick={() => reset(section.id)}><RotateCcw aria-hidden="true" /> Try again</button>
          {hasNextCore && <button type="button" className="vc-btn vc-next-set" onClick={() => setStep(coreIdx + 1)}>Next set <ChevronRight aria-hidden="true" /></button>}
        </> : <button type="button" className="vc-btn" onClick={() => check(si)}>{gradedHere.length ? 'Check answers' : 'Done'}</button>}
      </footer>
    </section>;
  }

  const doneSets = coreSections.filter(({ s }) => checked[s.id]).length;

  return <div className="vc-exercises">
    {useStepper && <div className="vc-stepper" aria-label="Exercise sets">
      <div className="vc-stepper-pills">
        {coreSections.map(({ s }, ci) => <button key={s.id} type="button"
          className={`vc-pill ${!showAll && ci === activeStep ? 'is-active' : ''} ${checked[s.id] ? 'is-done' : ''}`}
          onClick={() => { setShowAll(false); setStep(ci); }}>
          <span>{checked[s.id] ? '✓' : ci + 1}</span>
          <small>{s.title}</small>
        </button>)}
      </div>
      <div className="vc-stepper-tools">
        <span className="vc-stepper-meta">{doneSets} / {coreSections.length} sets checked</span>
        <button type="button" className="vc-btn-ghost vc-toggle-all" onClick={() => setShowAll(v => !v)}>
          <LayoutList aria-hidden="true" /> {showAll ? 'One set at a time' : 'Show all'}
        </button>
      </div>
    </div>}

    {useStepper && !showAll
      ? <>
        {renderSection(coreSections[activeStep].s, coreSections[activeStep].si, activeStep)}
        <div className="vc-stepper-nav">
          <button type="button" className="vc-btn-ghost" disabled={activeStep === 0} onClick={() => setStep(s => Math.max(0, s - 1))}><ChevronLeft aria-hidden="true" /> Previous set</button>
          <button type="button" className="vc-btn-ghost" disabled={activeStep >= coreSections.length - 1} onClick={() => setStep(s => Math.min(coreSections.length - 1, s + 1))}>Next set <ChevronRight aria-hidden="true" /></button>
        </div>
      </>
      : coreSections.map(({ s, si }, ci) => renderSection(s, si, ci))}

    {bonusSections.length > 0 && <details className="vc-extra">
      <summary><Sparkles aria-hidden="true" /> Extra practice · {bonusSections.length} optional bonus {bonusSections.length === 1 ? 'set' : 'sets'} (not required to pass)</summary>
      <div className="vc-extra-body">
        {bonusSections.map(({ s, si }) => renderSection(s, si))}
      </div>
    </details>}

    {allChecked && total > 0 && block !== 'review' && <p className={`vc-result ${score / total >= PASS ? 'is-pass' : ''}`} role="status">
      Score: <strong>{score} / {total}</strong> ({Math.round(score / total * 100)} %). {score / total >= PASS ? 'Great – this part is done.' : 'Aim for 80 %. Your mistakes are saved – practise them at the bottom of the page.'}
    </p>}
  </div>;
}

function OrderTask({ tokens, value, disabled, onChange, en }: { tokens: string[]; value: string; disabled: boolean; onChange: (v: string) => void; en?: string }) {
  const picked = value ? value.split(' ') : [];
  const used = [...picked];
  const left = tokens.filter(t => { const i = used.indexOf(t); if (i === -1) return true; used.splice(i, 1); return false; });
  return <div className="vc-order">
    {en && <span className="vc-prompt">{en}</span>}
    <div className="vc-order-line" aria-label="Your sentence" lang="de">{picked.length ? picked.map((t, i) =>
      <button key={i} type="button" disabled={disabled} onClick={() => onChange(picked.filter((_, j) => j !== i).join(' '))}>{t}</button>) : <span className="vc-order-empty">Tap the words below</span>}</div>
    <div className="vc-order-bank" lang="de">{left.map((t, i) => <button key={i} type="button" disabled={disabled} onClick={() => onChange([...picked, t].join(' '))}>{t}</button>)}</div>
  </div>;
}
