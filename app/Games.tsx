'use client';
import { useState } from 'react';
import {
  type Excuse, type HotTake, type Identity, makeExcuse, makeHotTake, makeIdentity, makeTwist, nextQuestion, ratherDeck,
} from '../lib/games';
import TalkTimer from './TalkTimer';

// Every game below is mounted only after the user picks it, so Math.random in useState initialisers can't cause hydration mismatches.

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="vtopic"><h3>{title}</h3>{children}</div>
);

/** Identity Crisis: a ridiculous identity to stay in character as, interview questions, and a mid-speech twist. */
export function IdentityCrisis() {
  const [me, setMe] = useState<Identity>(() => makeIdentity());
  const [twist, setTwist] = useState<Identity | null>(null);
  const [q, setQ] = useState(() => nextQuestion());
  const fresh = () => { setMe(makeIdentity()); setTwist(null); setQ(nextQuestion()); };
  return (
    <div className="vres">
      <div className="eyebrow">Your new identity</div>
      <div className="vbig" aria-hidden>🎭</div>
      <div className="vtitle">{me.name}, {me.job}</div>
      <Card title="Your quirks">
        <p>Always: {me.quirk}.<br />Secretly: {me.secret}.</p>
      </Card>
      <Card title="🎤 Interview question. Answer in character.">
        <p>{q}</p>
      </Card>
      <TalkTimer key={me.name + me.job + q} seconds={90} label="Start the 90-second interview" />
      {twist ? (
        <div className="vtwist" role="alert">
          <b>😱 IDENTITY CRISIS!</b> Mid-sentence you forget who you are. You are now <b>{twist.name}, {twist.job}</b>, who {twist.quirk}. Keep going as if nothing happened.
        </div>
      ) : (
        <button type="button" className="ghost vgap" onClick={() => setTwist(makeTwist(me))}>😱 Trigger the identity crisis</button>
      )}
      <div className="vacts">
        <button type="button" className="ghost" onClick={() => setQ(nextQuestion(Math.random, q))}>💬 Next question</button>
        <button type="button" className="ghost" onClick={fresh}>🔁 New identity</button>
      </div>
    </div>
  );
}

/** Hot Take Roulette: a silly statement and a random side to defend. */
export function HotTakeRoulette() {
  const [t, setT] = useState<HotTake>(() => makeHotTake());
  return (
    <div className="vres">
      <div className="eyebrow">Defend your side</div>
      <div className="vbig" aria-hidden>🔥</div>
      <div className="vtitle">You are {t.stance}</div>
      <Card title={`“${t.statement}”`}>
        <p>Argue {t.stance === 'FOR' ? 'in favour' : 'against'} with total confidence. No smiling. One minute.</p>
      </Card>
      <TalkTimer key={t.statement + t.stance} seconds={60} label="Start the 1-minute debate" />
      <div className="vacts">
        <button type="button" className="ghost" onClick={() => setT(makeHotTake(Math.random, t.statement))}>🔀 Spin again</button>
      </div>
    </div>
  );
}

/** Would You Rather: pick one, then justify it out loud. Cycles through a shuffled deck. */
export function WouldYouRather() {
  const [deck, setDeck] = useState(() => ratherDeck());
  const [i, setI] = useState(0);
  const [choice, setChoice] = useState<0 | 1 | null>(null);
  const [a, b] = deck[i];
  const next = () => {
    setChoice(null);
    if (i + 1 < deck.length) setI(i + 1);
    else { setDeck(ratherDeck()); setI(0); }
  };
  return (
    <div className="vres">
      <div className="eyebrow">Would you rather…</div>
      <div className="vbig" aria-hidden>🤔</div>
      <div className="vopts vgap">
        {[a, b].map((text, n) => (
          <button type="button" key={text} className={`vopt ${choice === n ? 'picked' : ''}`} disabled={choice !== null && choice !== n} onClick={() => setChoice(n as 0 | 1)}>{text}</button>
        ))}
      </div>
      {choice !== null && (
        <>
          <p className="vtext vgap">Now defend it. Out loud. Convincingly. You have 30 seconds.</p>
          <TalkTimer key={a + b} seconds={30} label="Start the 30-second defence" />
        </>
      )}
      <div className="vacts">
        <button type="button" className="ghost" onClick={next}>➡️ Next one</button>
      </div>
    </div>
  );
}

/** Excuse Master: a disaster plus a word that must appear in the excuse. */
export function ExcuseMaster() {
  const [e, setE] = useState<Excuse>(() => makeExcuse());
  return (
    <div className="vres">
      <div className="eyebrow">Explain yourself</div>
      <div className="vbig" aria-hidden>🙈</div>
      <div className="vtitle">{e.scenario}</div>
      <Card title="Your excuse must include…"><p>{e.include}</p></Card>
      <TalkTimer key={e.scenario + e.include} seconds={45} label="Start the 45-second excuse" />
      <div className="vacts">
        <button type="button" className="ghost" onClick={() => setE(makeExcuse(Math.random, e.scenario))}>🔀 New disaster</button>
      </div>
    </div>
  );
}
