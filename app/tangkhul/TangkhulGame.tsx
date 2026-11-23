'use client';
import { useEffect, useMemo, useState } from 'react';
import { BONUS, CHALLENGE, GOOD, SURVIVAL, STYLES, TRY, options, pick, type Item } from '../../lib/tangkhul';

type Mode = 'challenge' | 'survival';
const MODES: { id: Mode; emoji: string; name: string; blurb: string; how: string[] }[] = [
  { id: 'challenge', emoji: '🗣️', name: 'Word Guess', blurb: 'See a Tangkhul word. Guess what it means.', how: [
    'A Tangkhul word appears on the screen.', 'Host taps "Pick a person": a random name is chosen, and nobody is picked twice until everyone has had a turn. Each person answers only ONE word. (The others can help or shout!)', 'The player guesses the meaning: A, B or C. Tamil or English is fine.',
    'Host taps "Reveal the answer".', 'Someone says the word out loud. Tap "Pronounce it!" for a funny style to say it in.',
    'Give points: +2 for the right meaning, +2 for good pronunciation.', 'At the end: make a funny English sentence with a new word (+3 for the best).'] },
  { id: 'survival', emoji: '🏔️', name: 'Survival Test', blurb: 'A funny situation with a Tangkhul word. What does it mean?', how: [
    'The screen shows a situation, for example: a village auntie hands you food and says one Tangkhul word.', 'Host taps "Pick a person": a random name, one situation per person. That person guesses what the word means: A, B or C.',
    'Host reveals the answer. Everyone repeats the word out loud.', 'Then a TWIST appears to make it funnier!',
    'Points: +2 right answer, +2 pronunciation, +3 for the most entertaining attempt.'] },
];
const LETTERS = ['A', 'B', 'C'];

// Saved in this browser so a refresh keeps scores and progress. Every access is guarded: storage can be blocked.
const KEY = 'tangkhul-game-v1';

/** Random person who has not had a turn yet. Once everyone has had one, a fresh round starts. */
function drawName(players: string[], turns: string[], rnd: () => number = Math.random): string | null {
  if (!players.length) return null;
  let used: string[] = [];
  for (const t of turns) {
    if (!players.includes(t)) continue;
    if (used.includes(t)) used = [];
    used.push(t);
  }
  if (used.length >= players.length) used = [];
  const pool = players.filter((n) => !used.includes(n));
  return pool[Math.floor(rnd() * pool.length)];
}
function load<T>(k: string): T | null {
  try { const v = localStorage.getItem(`${KEY}:${k}`); return v ? (JSON.parse(v) as T) : null; } catch { return null; }
}
function save(k: string, v: unknown) {
  try { localStorage.setItem(`${KEY}:${k}`, JSON.stringify(v)); } catch { /* storage unavailable: just don't persist */ }
}

type Flat = { round: string; item: Item; scenario?: { title: string; situation: string; twist: string } };
function deck(mode: Mode): Flat[] {
  if (mode === 'survival') return SURVIVAL.map((s) => ({ round: s.title, item: s.item, scenario: s }));
  return CHALLENGE.flatMap((r) => r.items.map((item) => ({ round: r.title, item })));
}

/** Host screen: show on the projector. Scores live in this page only (nothing is stored or sent). */
export default function TangkhulGame({ initialPlayers = [] }: { initialPlayers?: string[] }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [players, setPlayers] = useState<{ name: string; score: number }[]>(() => initialPlayers.map((name) => ({ name, score: 0 })));
  const [name, setName] = useState('');
  const [ready, setReady] = useState(false);
  // Restore after mount (not in the initial state) so server and client render the same HTML.
  useEffect(() => {
    const saved = load<{ name: string; score: number }[]>('players');
    if (Array.isArray(saved) && saved.length) setPlayers(saved.filter((p) => p && typeof p.name === 'string' && Number.isFinite(p.score)));
    const m = load<Mode>('mode');
    if (m === 'challenge' || m === 'survival') setMode(m);
    setReady(true);
  }, []);
  useEffect(() => { if (ready) save('players', players); }, [players, ready]);
  useEffect(() => { if (ready) save('mode', mode); }, [mode, ready]);
  const addNames = () => {
    const names = name.split(/[,\n]/).map((n) => n.trim()).filter(Boolean);
    if (names.length) { setPlayers([...players, ...names.map((n) => ({ name: n, score: 0 }))]); setName(''); }
  };

  const board = (
    <div className="tkboard">
      <div className="tkadd">
        <input value={name} placeholder="Add another player" onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addNames(); }} />
        <button type="button" onClick={addNames}>Add</button>
      </div>
      {players.length > 0 && (
        <div className="vacts">
          <button type="button" className="ghost" onClick={() => { if (confirm('Set every score back to 0 and restart the games?')) { setPlayers(players.map((p) => ({ ...p, score: 0 }))); try { localStorage.removeItem(`${KEY}:progress:challenge`); localStorage.removeItem(`${KEY}:progress:survival`); } catch { /* ignore */ } setMode(null); } }}>↺ Reset scores</button>
        </div>
      )}
      {players.map((p, i) => (
        <div className="tkplayer" key={i} id={`tkp-${i}`}>
          <b>{p.name}</b>
          <span className="tkscore">{p.score}</span>
          {[[2, '+2 meaning'], [2, '+2 sound'], [3, '+3 bonus']].map(([pts, label]) => (
            <button type="button" key={label as string} className="ghost" onClick={() => setPlayers(players.map((q, j) => j === i ? { ...q, score: q.score + (pts as number) } : q))}>{label}</button>
          ))}
          <button type="button" className="ghost" aria-label={`remove ${p.name}`} onClick={() => setPlayers(players.filter((_, j) => j !== i))}>✕</button>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <span className="emoji">🏔️</span>
      <h1>Can you speak Tangkhul?</h1>
      <p className="sub">A quiz where we learn a few words of the Tangkhul language, my mother tongue. Pick a game below. You can answer in Tamil or English, and everyone takes a turn!</p>
      {mode ? (
        <>
          <button type="button" className="ghost" onClick={() => setMode(null)}>← All games</button>
          <Play key={mode} mode={mode} players={players.map((p) => p.name)} how={MODES.find((m) => m.id === mode)!.how} />
        </>
      ) : (
        <div className="vgames">
          {MODES.map((m) => (
            <button type="button" key={m.id} className="vgame" onClick={() => setMode(m.id)}>
              <span className="vgemoji" aria-hidden>{m.emoji}</span>
              <span><b>{m.name}</b><small>{m.blurb}</small></span>
            </button>
          ))}
        </div>
      )}
      <h2 style={{ marginTop: 28 }}>🏆 Scoreboard</h2>
      <p className="vtext">Saved on this device, so a refresh keeps the scores.</p>
      {board}
    </>
  );
}

function Play({ mode, how, players }: { mode: Mode; how: string[]; players: string[] }) {
  const cards = useMemo(() => deck(mode), [mode]);
  const [i, setI] = useState(0);
  const [pick_, setPick] = useState<number | null>(null);
  const [shown, setShown] = useState(false);
  const [style, setStyle] = useState<string | null>(null);
  const [cheer, setCheer] = useState<string | null>(null);
  const [bonus, setBonus] = useState(false);
  const [started, setStarted] = useState(false);
  const [turns, setTurns] = useState<string[]>([]); // turns[n] = who answers card n
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const p = load<{ i: number; started: boolean; turns?: string[] }>(`progress:${mode}`);
    if (p && Number.isInteger(p.i) && p.i >= 0 && p.i < cards.length) {
      setI(p.i); setStarted(!!p.started);
      if (Array.isArray(p.turns)) setTurns(p.turns.filter((t) => typeof t === 'string'));
    }
    setReady(true);
  }, [mode, cards.length]);
  useEffect(() => { if (ready) save(`progress:${mode}`, { i, started, turns }); }, [i, started, turns, ready, mode]);

  const card = cards[i];
  const opts = useMemo(() => (card ? options(card.item) : null), [card]);
  const go = (n: number) => { setI(n); setPick(null); setShown(false); setStyle(null); setCheer(null); };

  if (!started) {
    return (
      <div className="vres vgap">
        <div className="vtitle">How to play</div>
        <ol className="tkhow">{how.map((h) => <li key={h}>{h}</li>)}</ol>
        <p className="vtext">Everyone from the participant list is already in the scoreboard below. Remove anyone who is absent.</p>
        <button type="button" onClick={() => setStarted(true)}>▶️ Start</button>
      </div>
    );
  }
  if (bonus || !card || !opts) {
    return (
      <div className="vres vgap">
        <div className="vbig" aria-hidden>🎉</div>
        <div className="vtitle">Bonus challenge!</div>
        <div className="vtopic"><h3>Host reads</h3><p>{BONUS[mode]}</p></div>
        <div className="vacts"><button type="button" className="ghost" onClick={() => { setBonus(false); go(0); }}>🔁 Play again</button></div>
      </div>
    );
  }
  const { item, scenario } = card;
  // One word per person: names are drawn at random and nobody is drawn twice until everyone has had a turn.
  const turn = turns[i] ?? null;
  const draw = () => { const n = drawName(players, turns.slice(0, i)); if (n) { const t = turns.slice(0, i); t[i] = n; setTurns(t); } };
  const last = i === cards.length - 1;

  return (
    <div className="vres vgap">
      <div className="eyebrow">{card.round} · {i + 1} of {cards.length}</div>
      <div>
        {turn ? <span className="tkturn">🎯 Your turn: <b>{turn}</b></span>
          : players.length ? <button type="button" onClick={draw}>🎲 Pick a person</button>
          : <span className="tkturn">Add players below so each person gets one word</span>}
      </div>
      {scenario && (
        <div className="vtopic"><h3>The situation</h3><p>{scenario.situation}</p></div>
      )}
      <div className="tkword">{item.tangkhul}</div>
      <div className="vopts vgap">
        {opts.list.map((text, n) => {
          const state = shown ? (n === opts.correct ? 'right' : 'dim') : pick_ === n ? 'picked' : '';
          return <button type="button" key={text} className={`vopt ${state}`} onClick={() => setPick(n)}><b>{LETTERS[n]}.</b> {text}</button>;
        })}
      </div>
      {!shown ? (
        <button type="button" className="full" onClick={() => setShown(true)}>👀 Reveal the answer</button>
      ) : (
        <>
          <div className="vtopic">
            <h3>Answer</h3>
            <p>{item.tangkhul} = {item.meaning}</p>
            {item.say && <p className="tksay">Say it: <b>{item.say}</b></p>}
          </div>
          {item.fun && <div className="vtopic"><h3>Fun fact</h3><p>{item.fun}</p></div>}
          {scenario && <div className="vtwist" role="alert"><b>😱 TWIST!</b> {scenario.twist}</div>}
          <div className="vacts vgap">
            <button type="button" className="ghost" onClick={() => setStyle(pick(STYLES))}>🎤 Pronounce it!</button>
            {style && <button type="button" className="ghost" onClick={() => setCheer(pick(Math.random() < 0.6 ? GOOD : TRY))}>🎭 Judge the attempt</button>}
          </div>
          {style && <p className="vtext vgap"><b>Style challenge:</b> {style}</p>}
          {cheer && <p className="vtext"><b>{cheer}</b></p>}
        </>
      )}
      <div className="vacts vgap">
        {i > 0 && <button type="button" className="ghost" onClick={() => go(i - 1)}>← Back</button>}
        {!last ? <button type="button" onClick={() => go(i + 1)}>Next ➡️</button> : <button type="button" onClick={() => setBonus(true)}>🎉 Bonus round</button>}
      </div>
    </div>
  );
}
