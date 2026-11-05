'use client';
import { FormEvent, useEffect, useState } from 'react';

// Non-sensitive UI state only. The assignment itself is never persisted client-side.
const LS_EMAIL = 'ff:email';
const LS_NAME = 'ff:name';
const SS_REVEALED = 'ff:revealed';
const safe = <T,>(fn: () => T): T | undefined => { try { return fn(); } catch { return undefined; } };

type View =
  | { k: 'loading' }
  | { k: 'form'; error?: string; locked?: boolean }
  | { k: 'assignment'; name: string; assignment: string | null };

export default function Home() {
  const [view, setView] = useState<View>({ k: 'loading' });
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [revealed, setRevealed] = useState(false);

  async function loadAssignment(): Promise<boolean> {
    const r = await fetch('/api/assignment', { cache: 'no-store' });
    if (!r.ok) return false;
    const d = await r.json();
    safe(() => localStorage.setItem(LS_NAME, d.name));
    setRevealed(safe(() => sessionStorage.getItem(SS_REVEALED) === '1') ?? false);
    setView({ k: 'assignment', name: d.name, assignment: d.assignment });
    return true;
  }

  useEffect(() => {
    setEmail(safe(() => localStorage.getItem(LS_EMAIL)) ?? '');
    loadAssignment().then((ok) => !ok && setView({ k: 'form' })).catch(() => setView({ k: 'form', error: 'Could not reach the server.' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch('/api/access', {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const d = await r.json();
      if (r.ok) {
        safe(() => localStorage.setItem(LS_EMAIL, email.trim().toLowerCase()));
        if (!(await loadAssignment())) setView({ k: 'form', error: 'Something went wrong. Please try again.' });
      } else setView({ k: 'form', error: d.error, locked: d.code === 'DEVICE_LOCKED' });
    } catch {
      setView({ k: 'form', error: 'Could not reach the server.' });
    } finally {
      setBusy(false);
    }
  }

  function reveal() {
    setRevealed(true);
    safe(() => sessionStorage.setItem(SS_REVEALED, '1'));
  }

  return (
    <main>
      <div className="card">
        <span className="emoji">🎉</span>
        {view.k === 'loading' && <div className="skel" aria-busy />}
        {view.k === 'form' && (
          <form onSubmit={submit}>
            <h1>Fun Friday</h1>
            <p className="sub">Enter your email to see your assignment.</p>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" inputMode="email" autoComplete="email" autoFocus required
              placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <button className="full" disabled={busy}>{busy ? 'Checking…' : 'Continue'}</button>
            {view.error && <div className={`msg ${view.locked ? 'lock' : ''}`} role="alert">{view.error}</div>}
            <p className="fine">This links your assignment to this device. It can only be opened on one device.</p>
          </form>
        )}
        {view.k === 'assignment' && (
          <>
            <h1>Hi {view.name.split(' ')[0]}!</h1>
            <p className="sub">Your Friday assignment:</p>
            <div className={`reveal ${revealed ? '' : 'hidden'}`}>
              <div className="secret" aria-hidden={!revealed}>{view.assignment ?? 'Nothing assigned yet — check back soon.'}</div>
              {!revealed && <button onClick={reveal}>Tap to reveal</button>}
            </div>
            <p className="fine">Keep it secret 🤫 · Opened on this device only</p>
          </>
        )}
      </div>
    </main>
  );
}
