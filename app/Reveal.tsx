'use client';
import { useEffect, useMemo, useState } from 'react';

// Display only. This component is rendered ONLY when the server has already unlocked the character
// for this person (host action). There is no user-side reveal/hide: nothing here can unlock anything.
const SS_CELEBRATED = 'ff:celebrated'; // UI state only: play the confetti once per tab session
const safe = <T,>(fn: () => T): T | undefined => { try { return fn(); } catch { return undefined; } };
const COLORS = ['#6d4aff', '#ff5fa2', '#ffc53d', '#2dd4bf', '#60a5fa'];

export default function Reveal({ text, emoji }: { text: string; emoji: string }) {
  const [burst, setBurst] = useState(false);

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
        <div className="secret">{text}</div>
      </div>
    </>
  );
}
