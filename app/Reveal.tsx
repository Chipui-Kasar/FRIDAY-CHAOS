'use client';
import { useEffect, useMemo, useState } from 'react';

// Display only. This component is rendered ONLY when the server has already unlocked the character
// for this person (host action). There is no user-side reveal/hide: nothing here can unlock anything.
const SS_CELEBRATED = 'ff:celebrated'; // UI state only: play the confetti once per tab session
const safe = <T,>(fn: () => T): T | undefined => { try { return fn(); } catch { return undefined; } };
const COLORS = ['#6d4aff', '#ff5fa2', '#ffc53d', '#2dd4bf', '#60a5fa'];

type Parsed = { title: string; mission: string; lines: string[]; talk: { who: string; say: string }[] } | null;

// Turns the stored assignment text into sections by position (title, mission, lines, dialogue), so the same
// layout works for English and Tamil. Anything that doesn't match falls back to plain text.
const unquote = (t: string) => t.trim().replace(/^["“]|["”]$/g, '');
function parse(text: string): Parsed {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length < 4) return null;
  const rest = (b: string) => b.split('\n').slice(1).join('\n').trim();
  return {
    title: blocks[0],
    mission: rest(blocks[1]),
    lines: rest(blocks[2]).split('\n').map((l) => unquote(l.replace(/^-\s*/, ''))).filter(Boolean),
    talk: rest(blocks[3]).split('\n').map((l) => { const i = l.indexOf(':'); return i > 0 ? { who: l.slice(0, i).trim(), say: unquote(l.slice(i + 1)) } : { who: '', say: l }; }),
  };
}

const LABELS = {
  en: { tag: 'Your character', mission: '🎯 Your mission', lines: '💬 Say things like', talk: '🎬 How it plays out', keep: '🤫 Keep this assignment secret!' },
  ta: { tag: 'உங்கள் கதாபாத்திரம்', mission: '🎯 உங்கள் பணி', lines: '💬 இப்படிச் சொல்லலாம்', talk: '🎬 கூட்டம் எப்படி நடக்கும்', keep: '🤫 இந்த ரகசியத்தை வெளியில் சொல்லாதீர்கள்!' },
};
const SS_LANG = 'ff:lang'; // UI preference only
const safeGet = () => { try { return sessionStorage.getItem(SS_LANG); } catch { return null; } };
const safeSet = (v: string) => { try { sessionStorage.setItem(SS_LANG, v); } catch { /* ignore */ } };

export default function Reveal({ text, textTa, emoji }: { text: string; textTa?: string | null; emoji: string }) {
  const [burst, setBurst] = useState(false);
  const [lang, setLang] = useState<'en' | 'ta'>('en');
  useEffect(() => { if (textTa && safeGet() === 'ta') setLang('ta'); }, [textTa]);
  const shown = lang === 'ta' && textTa ? textTa : text;
  const L = LABELS[lang === 'ta' && textTa ? 'ta' : 'en'];
  const parsed = useMemo(() => parse(shown), [shown]);
  const toggle = () => { const n = lang === 'en' ? 'ta' : 'en'; setLang(n); safeSet(n); };

  useEffect(() => {
    if (safe(() => sessionStorage.getItem(SS_CELEBRATED) === '1')) return;
    safe(() => sessionStorage.setItem(SS_CELEBRATED, '1'));
    safe(() => navigator.vibrate?.(60));
    setBurst(true);
  }, []);

  const pieces = useMemo(
    () => Array.from({ length: 28 }, (_, i) => ({
      x: Math.round((Math.random() - 0.5) * 520), y: -Math.round(120 + Math.random() * 220),
      r: Math.round(Math.random() * 720 - 360), c: COLORS[i % COLORS.length], d: Math.round(Math.random() * 120),
    })),
    [],
  );

  return (
    <>
      <div className="reveal open">
        {burst && (
          <div className="confetti" aria-hidden>
            {pieces.map((p, i) => (
              <i key={i} style={{ background: p.c, animationDelay: `${p.d}ms`, ['--x' as string]: `${p.x}px`, ['--y' as string]: `${p.y}px`, ['--r' as string]: `${p.r}deg` }} />
            ))}
          </div>
        )}
        <div className="bigemoji" aria-hidden>{emoji}</div>
        {textTa && (
          <button type="button" className="langbtn" onClick={toggle} aria-pressed={lang === 'ta'}>
            {lang === 'en' ? '🌐 தமிழில் படிக்க' : '🌐 Read in English'}
          </button>
        )}
        {parsed ? (
          <div className="char">
            <div className="eyebrow">{L.tag}</div>
            <div className="ctitle">{parsed.title}</div>
            <section className="sec"><h3>{L.mission}</h3><p>{parsed.mission}</p></section>
            {parsed.lines.length > 0 && (
              <section className="sec"><h3>{L.lines}</h3>
                <ul className="quotes">{parsed.lines.map((l, i) => <li key={i}>“{l}”</li>)}</ul>
              </section>
            )}
            {parsed.talk.length > 0 && (
              <section className="sec"><h3>{L.talk}</h3>
                <div className="chat">
                  {parsed.talk.map((t, i) => (
                    <div key={i} className={`bub ${t.who === 'You' || t.who === 'நீங்கள்' ? 'me' : ''}`}>
                      {t.who && <b>{t.who}</b>}<span>{t.say}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <p className="keep">{L.keep}</p>
          </div>
        ) : (
          <div className="secret">{shown}</div>
        )}
      </div>
    </>
  );
}
