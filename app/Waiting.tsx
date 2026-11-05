'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const pad = (n: number) => String(n).padStart(2, '0');
function parts(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
const JOKES = [
  'Buffering… like a SharePoint list view with 5,000 items.',
  'Waiting for the host to approve your request (it’s in the workflow).',
  'Your character is being provisioned. This may take a moment.',
  'Indexing the fun. Search crawl in progress…',
];

/** Countdown to the scheduled reveal, or a waiting room if the host will open it manually. */
export default function Waiting({ revealAtMs, serverNowMs }: { revealAtMs: number | null; serverNowMs: number }) {
  const router = useRouter();
  const offset = useRef(serverNowMs - Date.now()); // trust the server clock, not the phone's
  const [secs, setSecs] = useState<number | null>(revealAtMs === null ? null : Math.ceil((revealAtMs - serverNowMs) / 1000));
  const [joke, setJoke] = useState(0);
  const checking = useRef(false);

  useEffect(() => {
    // Ask the server (cheap JSON, not a full page render). Only when it says "unlocked" do we re-render the page.
    const check = async () => {
      if (checking.current) return;
      checking.current = true;
      try {
        const r = await fetch('/api/status', { cache: 'no-store' });
        const d = await r.json();
        if (!d.locked || !d.signedIn) router.refresh();
      } catch { /* offline: try again next time */ } finally { checking.current = false; }
    };
    // Countdown: state only changes once per second, so React re-renders once per second (not 4x).
    const tick = setInterval(() => {
      if (revealAtMs === null) return;
      const left = Math.ceil((revealAtMs - (Date.now() + offset.current)) / 1000);
      setSecs((prev) => (prev === Math.max(0, left) ? prev : Math.max(0, left)));
      if (left <= 0) check();
    }, 500);
    const poll = setInterval(() => { if (!document.hidden) check(); }, 10000);
    const onVis = () => { if (!document.hidden) check(); };
    document.addEventListener('visibilitychange', onVis);
    const jk = setInterval(() => { if (!document.hidden) setJoke((j) => (j + 1) % JOKES.length); }, 6000);
    return () => { clearInterval(tick); clearInterval(poll); clearInterval(jk); document.removeEventListener('visibilitychange', onVis); };
  }, [revealAtMs, router]);

  const left = secs !== null ? parts(secs * 1000) : null;
  return (
    <div className="waiting" role="status" aria-live="polite">
      {left ? (
        <>
          <div className="wlabel">Your character unlocks in</div>
          <div className="clock">
            {left.d > 0 && <div><b>{left.d}</b><span>days</span></div>}
            {(left.d > 0 || left.h > 0) && <div><b>{pad(left.h)}</b><span>hrs</span></div>}
            <div><b>{pad(left.m)}</b><span>min</span></div>
            <div><b>{pad(left.s)}</b><span>sec</span></div>
          </div>
        </>
      ) : (
        <>
          <div className="wlabel">Waiting for the host to open the reveal</div>
          <div className="dots" aria-hidden><i /><i /><i /></div>
        </>
      )}
      <p className="wjoke" key={joke}>{JOKES[joke]}</p>
      <p className="wsub">You’re all set. This page updates by itself, so no need to refresh.</p>
    </div>
  );
}
