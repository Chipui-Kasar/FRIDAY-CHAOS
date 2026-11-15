'use client';
import { useEffect, useState } from 'react';
import { TALK_SECONDS, makeTopic, pickQuestions, scoreAnswers, type Archetype, type Question, type TypeKey } from '../lib/vibe';
import TalkTimer from './TalkTimer';

type Stage =
  | { s: 'quiz'; qs: Question[]; i: number; picked: TypeKey[] }
  | { s: 'result'; who: Archetype; topic: string };

/** Quiz → personality type → random topic to talk about for 2 minutes. Stores nothing. Mounted only after the user picks it. */
export default function VibeCheck() {
  const [st, setSt] = useState<Stage | null>(null);
  // Questions are random, so they're created on the client after mount (never during server rendering).
  useEffect(() => { setSt({ s: 'quiz', qs: pickQuestions(), i: 0, picked: [] }); }, []);
  if (!st) return null;

  const start = () => setSt({ s: 'quiz', qs: pickQuestions(), i: 0, picked: [] });
  const answer = (t: TypeKey) => {
    if (st.s !== 'quiz') return;
    const picked = [...st.picked, t];
    if (st.i + 1 < st.qs.length) return setSt({ ...st, i: st.i + 1, picked });
    const who = scoreAnswers(picked);
    setSt({ s: 'result', who, topic: makeTopic(who.key) });
  };

  if (st.s === 'quiz') {
    return (
      <div key={st.i} className="vq">
        <div className="vprog" aria-hidden><i style={{ width: `${(st.i / st.qs.length) * 100}%` }} /></div>
        <div className="eyebrow">Question {st.i + 1} of {st.qs.length}</div>
        <h3 className="vqt">{st.qs[st.i].q}</h3>
        <div className="vopts">
          {st.qs[st.i].a.map((o) => <button type="button" key={o.text} className="vopt" onClick={() => answer(o.type)}>{o.text}</button>)}
        </div>
      </div>
    );
  }

  return (
    <div className="vres">
      <div className="eyebrow">You are a…</div>
      <div className="vbig" aria-hidden>{st.who.emoji}</div>
      <div className="vtitle">{st.who.title}</div>
      <p className="vtext">{st.who.roast}</p>
      <div className="vtopic">
        <h3>🎤 Your topic. Talk about it for 2 minutes.</h3>
        <p>{st.topic}</p>
      </div>
      <TalkTimer key={st.topic} seconds={TALK_SECONDS} label="Start the 2-minute timer" />
      <div className="vacts">
        <button type="button" className="ghost" onClick={() => setSt({ ...st, topic: makeTopic(st.who.key, Math.random, st.topic) })}>🔀 Different topic</button>
        <button type="button" className="ghost" onClick={start}>🔁 Retake quiz</button>
      </div>
    </div>
  );
}
