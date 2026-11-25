'use client';
import { useMemo, useState } from 'react';
import { CheckCircle2, MessageCircle, Receipt, Mail, MapPin, Megaphone, UtensilsCrossed, IdCard, FileText } from 'lucide-react';
import type { ChatItem, MatchItem, ReadingText, SortItem, Speaker } from '@/app/video-course/types';
import { AudioButton } from '@/app/video-course/tasks';

const NAMES: Record<Speaker, string> = {
  T: 'Frau Weber', A: 'Arjun', N: 'Amara', Y: 'Yuki', M: 'Mateo', O: 'Herr Özdemir', S: 'Frau Schulz',
};
const AVATAR: Record<Speaker, string> = {
  T: 'weber', A: 'arjun', N: 'amara', Y: 'yuki', M: 'mateo', O: 'oezdemir', S: 'schulz',
};

/** Deterministic shuffle so SSR and client match cleanly without hydration warnings. */
function stableShuffle<T>(arr: T[], seedStr: string): T[] {
  let s = 2166136261;
  for (let i = 0; i < seedStr.length; i++) s = Math.imul(s ^ seedStr.charCodeAt(i), 16777619);
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    const j = s % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function parseJsonMap(value: string): Record<string, string> {
  if (!value) return {};
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' ? parsed : {}; } catch { return {}; }
}

/* ------------------------------------------------------------------ Match (tap-to-pair) */
export function MatchTask({ item, value, disabled, onChange }: {
  item: MatchItem; value: string; disabled: boolean; onChange: (v: string) => void;
}) {
  const matched = parseJsonMap(value);
  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [wrongPair, setWrongPair] = useState<[string, string] | null>(null);
  const rightOptions = useMemo(
    () => stableShuffle(item.pairs.map(([, r]) => r), item.pairs.map(p => p[0]).join('|')),
    [item.pairs],
  );
  const matchedRights = new Set(Object.values(matched));
  const doneCount = Object.keys(matched).length;

  function pickRight(right: string) {
    if (disabled || !pickedLeft || matchedRights.has(right)) return;
    const expected = item.pairs.find(([l]) => l === pickedLeft)?.[1];
    if (expected === right) {
      const next = { ...matched, [pickedLeft]: right };
      onChange(JSON.stringify(next));
      setPickedLeft(null);
      setWrongPair(null);
    } else {
      setWrongPair([pickedLeft, right]);
      setTimeout(() => setWrongPair(null), 550);
    }
  }

  return <div className="vc-match">
    {item.prompt && <p className="vc-prompt">{item.prompt}</p>}
    <div className="vc-match-meta">
      <span>{doneCount} / {item.pairs.length} pairs matched</span>
      {!disabled && doneCount < item.pairs.length && <span className="vc-hint">{pickedLeft ? `Now tap the match for “${pickedLeft}”` : 'Tap a German card, then its match'}</span>}
    </div>
    <div className="vc-match-grid">
      <div className="vc-match-col" role="group" aria-label="German">
        {item.pairs.map(([left]) => {
          const isMatched = !!matched[left];
          const isPicked = pickedLeft === left;
          const isWrong = wrongPair?.[0] === left;
          return <button key={left} type="button" lang="de" disabled={disabled || isMatched}
            className={`vc-match-card ${isMatched ? 'is-matched' : ''} ${isPicked ? 'is-picked' : ''} ${isWrong ? 'is-shake' : ''}`}
            onClick={() => setPickedLeft(isPicked ? null : left)}>
            <span>{left}</span>{isMatched && <CheckCircle2 aria-hidden="true" />}
          </button>;
        })}
      </div>
      <div className="vc-match-col" role="group" aria-label="Match">
        {rightOptions.map(right => {
          const isMatched = matchedRights.has(right);
          const isWrong = wrongPair?.[1] === right;
          return <button key={right} type="button" disabled={disabled || isMatched || !pickedLeft}
            className={`vc-match-card ${isMatched ? 'is-matched' : ''} ${isWrong ? 'is-shake' : ''}`}
            onClick={() => pickRight(right)}>
            <span>{right}</span>{isMatched && <CheckCircle2 aria-hidden="true" />}
          </button>;
        })}
      </div>
    </div>
  </div>;
}

/* ------------------------------------------------------------------ Sort (bucket sorter) */
export function SortTask({ item, value, disabled, onChange }: {
  item: SortItem; value: string; disabled: boolean; onChange: (v: string) => void;
}) {
  const placed = parseJsonMap(value);
  const unplaced = item.cards.filter(c => !placed[c.text]);
  const [selected, setSelected] = useState<string | null>(null);
  const activeCard = selected && !placed[selected] ? selected : unplaced[0]?.text ?? null;

  function placeIn(bucketId: string) {
    if (disabled || !activeCard) return;
    const next = { ...placed, [activeCard]: bucketId };
    onChange(JSON.stringify(next));
    setSelected(null);
  }
  function remove(text: string) {
    if (disabled) return;
    const next = { ...placed };
    delete next[text];
    onChange(JSON.stringify(next));
    setSelected(text);
  }

  return <div className="vc-sort">
    {item.prompt && <p className="vc-prompt">{item.prompt}</p>}
    <div className="vc-sort-tray" aria-label="Cards to sort">
      {unplaced.length > 0 ? <>
        <span className="vc-sort-hint">Tap a bucket for the highlighted word ({unplaced.length} left):</span>
        <div className="vc-sort-pool">
          {unplaced.map(c => <button key={c.text} type="button" lang="de" disabled={disabled}
            className={`vc-sort-chip ${activeCard === c.text ? 'is-active' : ''}`}
            onClick={() => setSelected(c.text)}>
            {c.text}{c.note && <small> · {c.note}</small>}
          </button>)}
        </div>
      </> : <span className="vc-sort-hint">All {item.cards.length} words placed — tap any word in a bucket to move it, or check your answers.</span>}
    </div>
    <div className="vc-sort-buckets" style={{ gridTemplateColumns: `repeat(${Math.min(item.buckets.length, 3)}, minmax(0, 1fr))` }}>
      {item.buckets.map(b => {
        const cardsHere = item.cards.filter(c => placed[c.text] === b.id);
        return <div key={b.id} className={`vc-bucket ${b.tone ? `vc-tone-${b.tone}` : ''}`}>
          <button type="button" className="vc-bucket-head" disabled={disabled || !activeCard} onClick={() => placeIn(b.id)}>
            <strong>{b.label}</strong>
            {!disabled && activeCard && <small>+ Put here</small>}
          </button>
          <div className="vc-bucket-list">
            {cardsHere.map(c => {
              const ok = c.bucket === b.id;
              return <button key={c.text} type="button" lang="de" disabled={disabled}
                className={`vc-bucket-pill ${disabled ? (ok ? 'is-ok' : 'is-bad') : ''}`}
                title={disabled ? undefined : 'Click to move back'}
                onClick={() => remove(c.text)}>
                {c.text}
                {disabled && !ok && <small> → {item.buckets.find(x => x.id === c.bucket)?.label}</small>}
              </button>;
            })}
            {!cardsHere.length && <span className="vc-bucket-empty">Empty</span>}
          </div>
        </div>;
      })}
    </div>
  </div>;
}

/* ------------------------------------------------------------------ Chat (mini roleplay) */
export function ChatTask({ item, value, disabled, onChange }: {
  item: ChatItem; value: string; disabled: boolean; onChange: (v: string) => void;
}) {
  const picks = parseJsonMap(value);
  const [showEn, setShowEn] = useState(false);

  // Reveal turns progressively: show all turns up to the first unanswered reply turn.
  const visibleCount = useMemo(() => {
    if (disabled) return item.turns.length;
    for (let i = 0; i < item.turns.length; i++) {
      if (item.turns[i].reply && !picks[String(i)]) return i + 1;
    }
    return item.turns.length;
  }, [disabled, item.turns, picks]);

  function choose(ti: number, opt: string) {
    if (disabled) return;
    onChange(JSON.stringify({ ...picks, [String(ti)]: opt }));
  }

  return <div className="vc-chat">
    <div className="vc-chat-head">
      <div><strong>{item.title}</strong>{item.setting && <span> · {item.setting}</span>}</div>
      <button type="button" className="vc-btn-ghost vc-chat-en" onClick={() => setShowEn(s => !s)}>{showEn ? 'Hide English' : 'English hints'}</button>
    </div>
    <div className="vc-chat-feed">
      {item.turns.slice(0, visibleCount).map((turn, ti) => {
        const picked = picks[String(ti)] ?? '';
        const reply = turn.reply;
        const ok = reply ? picked === reply.answer : true;
        return <div key={ti} className="vc-chat-step">
          <div className="vc-bubble vc-bubble-in">
            <img className="vc-chat-avatar" src={`/video-course/img/${AVATAR[turn.who]}.webp`} alt="" width={36} height={71} loading="lazy" />
            <div className="vc-bubble-body">
              <div className="vc-bubble-top">
                <span className="vc-bubble-name">{NAMES[turn.who]}</span>
                {turn.audio && <AudioButton line={turn.audio} label="Play" />}
              </div>
              <p lang="de">{turn.text}</p>
              {showEn && turn.en && <p className="vc-bubble-en">{turn.en}</p>}
            </div>
          </div>
          {reply && <div className="vc-chat-reply">
            {picked ? <div className={`vc-bubble vc-bubble-out ${disabled ? (ok ? 'is-ok' : 'is-bad') : ''}`}>
              <span className="vc-bubble-name">You</span>
              <p lang="de">{picked}</p>
              {!disabled && <button type="button" className="vc-chat-change" onClick={() => {
                const next = { ...picks }; delete next[String(ti)]; onChange(JSON.stringify(next));
              }}>Change</button>}
              {disabled && !ok && <p className="vc-bubble-fix" lang="de">Better: {reply.answer}</p>}
              {disabled && reply.note && <p className="vc-bubble-en">{reply.note}</p>}
            </div> : <div className="vc-chat-choices">
              <span className="vc-chat-prompt">{reply.prompt}</span>
              <div className="vc-options">
                {reply.options.map(opt => <button key={opt} type="button" lang="de" onClick={() => choose(ti, opt)}>{opt}</button>)}
              </div>
            </div>}
          </div>}
        </div>;
      })}
    </div>
  </div>;
}

/* ------------------------------------------------------------------ Styled realia reading card */
const REALIA_META: Record<NonNullable<ReadingText['style']>, { label: string; Icon: typeof FileText }> = {
  notice: { label: 'Note', Icon: FileText },
  sign: { label: 'Info & Sign', Icon: MapPin },
  chat: { label: 'Messages', Icon: MessageCircle },
  menu: { label: 'Speisekarte', Icon: UtensilsCrossed },
  receipt: { label: 'Kassenbon', Icon: Receipt },
  email: { label: 'E-Mail', Icon: Mail },
  ad: { label: 'Anzeige', Icon: Megaphone },
  card: { label: 'Ausweis / Karte', Icon: IdCard },
};

export function ReadingCard({ text }: { text: ReadingText }) {
  const style = text.style ?? 'notice';
  const { label, Icon } = REALIA_META[style];
  const lines = text.body.split('\n');
  return <article className={`vc-reading vc-reading-${style}`} lang="de">
    <div className="vc-reading-bar">
      <span className="vc-reading-tag"><Icon aria-hidden="true" /> {label}</span>
      {text.meta && <span className="vc-reading-meta">{text.meta}</span>}
    </div>
    <h4>{text.title}</h4>
    <div className="vc-reading-body">
      {lines.map((ln, i) => <p key={i}>{ln}</p>)}
    </div>
    {text.glossary.length > 0 && <dl>{text.glossary.map(([de, en]) => <div key={de}><dt>{de}</dt><dd>{en}</dd></div>)}</dl>}
  </article>;
}
