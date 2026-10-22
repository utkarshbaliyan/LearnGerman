'use client';

import { ArrowRight, Eye, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { TopicArt } from '../components/topic-art';
import { lessonScene } from './lesson-scenes';

export function LessonScene({ lessonId }: { lessonId: string }) {
  const { scene, focusIndex } = lessonScene(lessonId);
  const [selected, setSelected] = useState(focusIndex);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showFocus, setShowFocus] = useState(true);
  const line = scene.lines[selected];
  const start = line.german.indexOf(line.focus);
  const moduleId = lessonId.split('-').slice(0, 2).join('-');

  return <section className="grammar-scene" id="grammar-scene" aria-labelledby="grammar-scene-title">
    <header className="grammar-scene-heading"><div><span className="grammar-editorial-kicker">A little story, a useful pattern</span><h3 id="grammar-scene-title">{scene.title}</h3><p>{scene.setting}</p></div><TopicArt kind={scene.art} className="grammar-scene-art" /></header>
    <div className="grammar-scene-toolbar"><p>Tap a sentence to explore its meaning and grammar.</p><button type="button" className="lesson-text-button" aria-pressed={showFocus} onClick={() => setShowFocus(value => !value)}><Sparkles aria-hidden="true" />{showFocus ? 'Hide highlight' : 'Highlight the pattern'}</button></div>
    <div className="grammar-scene-story" lang="de" aria-label="Story sentences">
      {scene.lines.map((item, index) => <span key={item.german}><button type="button" aria-pressed={selected === index} aria-label={`Explore sentence ${index + 1}: ${item.german}`} onClick={() => setSelected(index)}>
        {selected === index && showFocus ? <>{line.german.slice(0, start)}<mark>{line.focus}</mark>{line.german.slice(start + line.focus.length)}</> : item.german}
      </button>{' '}</span>)}
    </div>
    <div className="grammar-scene-insight" aria-live="polite" aria-atomic="true"><div className="grammar-scene-insight-label"><span>{selected === focusIndex ? 'This lesson’s pattern' : 'Another pattern in the story'} · sentence {selected + 1}</span><span lang="de">{line.focus}</span></div><p>{line.english}</p><p className="grammar-scene-notice">{line.note}</p>{selected !== focusIndex && <a href={`/grammar?lesson=${moduleId}-${selected + 1}#lesson`}>Explore this topic <ArrowRight aria-hidden="true" /></a>}</div>
    <button type="button" className="lesson-text-button grammar-scene-translation" aria-expanded={showEnglish} aria-controls="grammar-scene-english" onClick={() => setShowEnglish(value => !value)}><Eye aria-hidden="true" />{showEnglish ? 'Hide full translation' : 'Read the whole story in English'}</button>
    {showEnglish && <p className="grammar-scene-english" id="grammar-scene-english">{scene.lines.map(item => item.english).join(' ')}</p>}
    <footer className="grammar-scene-footer"><span>One scene across this module’s six topics.</span>{selected !== focusIndex && <button type="button" onClick={() => setSelected(focusIndex)}>Back to this lesson’s sentence</button>}</footer>
  </section>;
}
