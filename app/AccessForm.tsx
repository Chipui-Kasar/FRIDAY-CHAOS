'use client';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

const LS_EMAIL = 'ff:email'; // non-sensitive convenience prefill only
const safe = <T,>(fn: () => T): T | undefined => { try { return fn(); } catch { return undefined; } };

export default function AccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; locked: boolean } | null>(null);

  useEffect(() => { setEmail(safe(() => localStorage.getItem(LS_EMAIL)) ?? ''); }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/access', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email }) });
      const d = await r.json();
      if (r.ok) {
        safe(() => localStorage.setItem(LS_EMAIL, email.trim().toLowerCase()));
        router.refresh(); // server re-renders "/" with the assignment already in the HTML
        return;
      }
      setError({ text: d.error, locked: d.code === 'DEVICE_LOCKED' });
    } catch {
      setError({ text: 'Could not reach the server.', locked: false });
    }
    setBusy(false);
  }

  return (
    <form onSubmit={submit}>
      <h1>Fun Friday</h1>
      <p className="sub">Enter your email to see your assignment.</p>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" inputMode="email" autoComplete="email" autoFocus required
        placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="full" disabled={busy}>{busy ? 'Checking…' : 'Continue'}</button>
      {error && <div className={`msg ${error.locked ? 'lock' : ''}`} role="alert">{error.text}</div>}
      <p className="fine">This links your assignment to this device. It can only be opened on one device.</p>
    </form>
  );
}
