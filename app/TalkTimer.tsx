'use client';
import { useEffect, useRef, useState } from 'react';

const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const TIMES_UP = ['Time’s up! Take a bow 🎤', 'Time’s up! Applause (mandatory) 👏', 'Time’s up! You may now sit down with dignity 🪑'];

/**
 * Start / pause / resume countdown shared by every game. Parents pass a changing `key` to reset it
 * (new topic, new question). Uses an end timestamp so a throttled background tab can't make it drift.
 */
export default function TalkTimer({ seconds, label = 'Start the timer', onDone }: { seconds: number; label?: string; onDone?: () => void }) {
  const [left, setLeft] = useState<number | null>(null); // null = not started
  const [running, setRunning] = useState(false);
  const [bye, setBye] = useState(TIMES_UP[0]);
  const endsAt = useRef(0);
  const done = useRef(onDone);
  done.current = onDone;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      const l = Math.max(0, Math.ceil((endsAt.current - Date.now()) / 1000));
      setLeft(l);
      if (l === 0) {
        setRunning(false);
        setBye(TIMES_UP[Math.floor(Math.random() * TIMES_UP.length)]);
        try { navigator.vibrate?.([120, 60, 120]); } catch { /* not supported */ }
        done.current?.();
      }
    }, 250);
    return () => clearInterval(id);
  }, [running]);

  const go = () => { endsAt.current = Date.now() + seconds * 1000; setLeft(seconds); setRunning(true); };
  const toggle = () => {
    if (!running) endsAt.current = Date.now() + (left ?? 0) * 1000; // resume from the remaining time
    setRunning(!running);
  };

  if (left === null) return <button type="button" className="full" onClick={go}>{label}</button>;
  return (
    <div className={`vtimer ${left === 0 ? 'done' : ''}`} role="timer">
      {left === 0 ? <b>{bye}</b> : <b>{fmt(left)}</b>}
      {left !== 0 && <button type="button" className="ghost" onClick={toggle}>{running ? 'Pause' : 'Resume'}</button>}
    </div>
  );
}
