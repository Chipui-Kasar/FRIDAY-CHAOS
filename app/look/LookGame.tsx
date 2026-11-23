'use client';
import { useEffect, useRef, useState } from 'react';
import { objectsSpelling, pickThings, secretWord, type Thing } from '../../lib/heist';

// Two parts, deliberately given neutral names so nothing is spoiled on the projector.
//  part 1: any objects. Everyone writes down what they remember; most correct wins a surprise gift.
//  part 2: objects whose first letters spell one participant's name. It only works once (they all know the trick after).
type Part = { id: 1 | 2; label: string; look: number; write: number };
const PARTS: Part[] = [
  { id: 1, label: 'Part 1', look: 30, write: 45 },
  { id: 2, label: 'Part 2', look: 20, write: 45 },
];
type Stage = 'menu' | 'ready' | 'look' | 'write' | 'answers';
const COUNT = 20;

/** Big countdown; calls onDone once at zero. */
function Countdown({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const end = Date.now() + seconds * 1000;
    const t = setInterval(() => {
      const l = Math.max(0, Math.ceil((end - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) { clearInterval(t); done.current(); }
    }, 250);
    return () => clearInterval(t);
  }, [seconds]);
  return <div className={`lkclock ${left <= 5 ? 'hurry' : ''}`} role="timer" aria-live="off">{left}</div>;
}

const Grid = ({ things, letters }: { things: Thing[]; letters?: boolean }) => (
  <div className="lkgrid">
    {things.map((t) => (
      <div key={t.n} className="lkitem">{letters && <b className="lkletter">{t.n[0].toUpperCase()}</b>}<span className="lke" aria-hidden>{t.e}</span><span>{t.n}</span></div>
    ))}
  </div>
);

/** Host screen: show on the projector. Nothing here is stored or sent anywhere. */
export default function LookGame({ names = [] }: { names?: string[] }) {
  const [stage, setStage] = useState<Stage>('menu');
  const [part, setPart] = useState<Part>(PARTS[0]);
  const [lists, setLists] = useState<{ 1?: Thing[]; 2?: { word: string; things: Thing[] } }>({});
  const [reveal, setReveal] = useState(false);

  const start = (p: Part) => {
    // Part 2 is built ONCE (one person, one word) and kept, so going back to the menu never changes the answer.
    if (p.id === 2 && !lists[2]) {
      const all = names.map(secretWord).filter((n) => n.length >= 3);
      const word = all[Math.floor(Math.random() * all.length)];
      const things = word ? objectsSpelling(word) : null;
      if (!word || !things) { alert('No participant names found.'); return; }
      setLists({ ...lists, 2: { word, things } });
    }
    if (p.id === 1 && !lists[1]) setLists({ ...lists, 1: pickThings(COUNT) });
    setPart(p); setReveal(false); setStage('ready');
  };
  const things = part.id === 1 ? lists[1] ?? [] : lists[2]?.things ?? [];
  const word = lists[2]?.word ?? '';

  if (stage === 'menu') {
    return (
      <>
        <span className="emoji">👀</span>
        <h1>Look carefully</h1>
        <p className="sub">Host: pick one, then press Show when everyone is watching the screen.</p>
        <div className="vgames">
          {PARTS.map((p) => (
            <button type="button" key={p.id} className="vgame" onClick={() => start(p)}>
              <span className="vgemoji" aria-hidden>{p.id === 1 ? '🎯' : '🕵️'}</span>
              <span><b>{p.label}</b></span>
            </button>
          ))}
        </div>
      </>
    );
  }

  if (stage === 'ready') {
    return (
      <div className="vres">
        <div className="vbig" aria-hidden>👀</div>
        <h1>{part.label}</h1>
        <p className="sub">Everybody look at the screen. Stay quiet. No phones, no pens yet.</p>
        <button type="button" onClick={() => setStage('look')}>▶️ Show</button>
        <div className="vacts vgap"><button type="button" className="ghost" onClick={() => setStage('menu')}>← Back</button></div>
      </div>
    );
  }

  if (stage === 'look') {
    return (
      <div className="vres">
        <div className="eyebrow">{part.label} · Look carefully</div>
        <Countdown key={part.id} seconds={part.look} onDone={() => setStage('write')} />
        <Grid things={things} />
        <div className="vacts vgap"><button type="button" className="ghost" onClick={() => setStage('write')}>Skip ⏭️</button></div>
      </div>
    );
  }

  if (stage === 'write') {
    return (
      <div className="vres">
        <div className="vbig" aria-hidden>{part.id === 1 ? '✍️' : '🤔'}</div>
        {part.id === 1 ? (
          <>
            <h1>Write down everything you saw!</h1>
            <p className="sub">Pen and paper, or notes on your phone. Tamil or English is fine.<br />The person who remembers the most wins a surprise gift 🎁</p>
          </>
        ) : (
          <>
            <h1>Something is hidden in these things…</h1>
            <p className="sub">Think about the first letter of each thing, in order. What do they spell?</p>
          </>
        )}
        <Countdown key={`w${part.id}`} seconds={part.write} onDone={() => setStage('answers')} />
        <div className="vacts vgap"><button type="button" className="ghost" onClick={() => setStage('answers')}>Time is up ⏭️</button></div>
      </div>
    );
  }

  return (
    <div className="vres">
      <div className="eyebrow">{part.label} · The answers</div>
      {part.id === 1 ? (
        <>
          <h1>{things.length} things were on the screen</h1>
          <p className="sub">Check your list. 1 point for every correct thing. Most points wins the gift 🎁</p>
          <Grid things={things} />
        </>
      ) : (
        <>
          <h1>The first letters spell…</h1>
          <Grid things={things} letters />
          <div className="lkword">{reveal ? word : '?'.repeat(word.length)}</div>
          {!reveal && <div className="vacts"><button type="button" onClick={() => setReveal(true)}>🎉 Reveal the answer</button></div>}
        </>
      )}
      <div className="vacts vgap">
        <button type="button" className="ghost" onClick={() => setStage('menu')}>← Back</button>
        {part.id === 1 && <button type="button" onClick={() => start(PARTS[1])}>Next ➡️</button>}
      </div>
    </div>
  );
}
