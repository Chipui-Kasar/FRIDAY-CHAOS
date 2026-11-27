'use client';
import { useEffect, useMemo, useState } from 'react';

// Display only. This component is rendered ONLY when the server has already unlocked the character
// for this person (host action). There is no user-side reveal/hide: nothing here can unlock anything.
const SS_CELEBRATED = 'ff:celebrated'; // UI state only: play the confetti once per tab session
const safe = <T,>(fn: () => T): T | undefined => { try { return fn(); } catch { return undefined; } };
const COLORS = ['#6d4aff', '#ff5fa2', '#ffc53d', '#2dd4bf', '#60a5fa'];

type Parsed = { head: string; options: string[]; how: string; howTitle: string } | null;

// Stored text: "Pick one topic:" + "- option" lines, blank line, then "How to play:" + text.
// Anything that doesn't match falls back to plain text.
function parse(text: string): Parsed {
  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  if (blocks.length < 2) return null;
  const top = blocks[0].split('\n').map((l) => l.trim()).filter(Boolean);
  const options = top.slice(1).map((l) => l.replace(/^-\s*/, '')).filter(Boolean);
  if (options.length === 0) return null;
  const bl = blocks[1].split('\n');
  return { head: top[0], options, howTitle: bl[0], how: bl.slice(1).join('\n').trim() };
}

const LABELS = {
  en: { tag: 'Your extempore topics', keep: '🤫 Keep your topics to yourself until it’s your turn!' },
  ta: { tag: 'உங்கள் தலைப்புகள்', keep: '🤫 உங்கள் முறை வரும் வரை தலைப்புகளை சொல்லாதீர்கள்!' },
  bn: { tag: 'আপনার বিষয়', keep: '🤫 আপনার পালা না আসা পর্যন্ত বিষয়টি গোপন রাখুন!' },
};
const SS_LANG = 'ff:lang'; // UI preference only
const safeGet = () => { try { return sessionStorage.getItem(SS_LANG); } catch { return null; } };
const safeSet = (v: string) => { try { sessionStorage.setItem(SS_LANG, v); } catch { /* ignore */ } };

type Lang = 'en' | 'ta' | 'bn';
const BTN: Record<Lang, string> = { en: '🌐 Read in English', ta: '🌐 தமிழில் படிக்க', bn: '🌐 বাংলায় পড়ুন' };

// The optional second-language text is stored in `content_ta`. Sarat's is Bengali, so detect the script.
const isBengali = (t?: string | null) => !!t && /[\u0980-\u09FF]/.test(t);

export default function Reveal({ text, textTa, emoji }: { text: string; textTa?: string | null; emoji: string }) {
  const [burst, setBurst] = useState(false);
  const [lang, setLang] = useState<Lang>('en');
  const second: Lang = isBengali(textTa) ? 'bn' : 'ta';
  const texts: Record<Lang, string | null | undefined> = { en: text, ta: second === 'ta' ? textTa : null, bn: second === 'bn' ? textTa : null };
  useEffect(() => { if (textTa && safeGet() === second) setLang(second); }, [textTa, second]);
  const active: Lang = texts[lang] ? lang : 'en';
  const shown = texts[active] as string;
  const L = LABELS[active];
  const others = (['en', 'ta', 'bn'] as Lang[]).filter((l) => l !== active && texts[l]);
  const parsed = useMemo(() => parse(shown), [shown]);
  const pick = (n: Lang) => { setLang(n); safeSet(n); };

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
        {others.map((l) => (
          <button key={l} type="button" className="langbtn" onClick={() => pick(l)}>{BTN[l]}</button>
        ))}
        {parsed ? (
          <div className="char">
            <div className="eyebrow">{L.tag}</div>
            <div className="ctitle">{parsed.head}</div>
            <ul className="quotes">{parsed.options.map((o, i) => <li key={i}>{o}</li>)}</ul>
            <section className="sec"><h3>{parsed.howTitle}</h3><p>{parsed.how}</p></section>
            <p className="keep">{L.keep}</p>
          </div>
        ) : (
          <div className="secret">{shown.split('\n')[0]}</div>
        )}
      </div>
    </>
  );
}
