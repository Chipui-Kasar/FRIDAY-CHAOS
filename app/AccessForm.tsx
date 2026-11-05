'use client';
import { EVENT_NAME } from '../lib/brand';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';

const LS_EMAIL = 'ff:email'; // non-sensitive convenience prefill only
const safe = <T,>(fn: () => T): T | undefined => { try { return fn(); } catch { return undefined; } };

const TAGLINES = [
  'Loads faster than a SharePoint site on Monday morning.',
  'Fewer clicks than finding a file inside 14 nested folders.',
  'No site collection admin was harmed in the making of this.',
  'Not a classic page. Not a modern page. A fun page.',
  'Zero "Sorry, something went wrong" (we crossed our fingers).',
  'Permissions: Full Control… of your own fun only.',
  'Designed by people who have seen every web part.',
];

export default function AccessForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; locked: boolean } | null>(null);

  const [tag, setTag] = useState(0);
  useEffect(() => { setEmail(safe(() => localStorage.getItem(LS_EMAIL)) ?? ''); }, []);
  useEffect(() => {
    const t = setInterval(() => { if (!document.hidden) setTag((i) => (i + 1) % TAGLINES.length); }, 5000);
    return () => clearInterval(t);
  }, []);

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
      <div className="eyebrow">SharePoint Designs presents</div>
      <h1>{EVENT_NAME}</h1>
      <p className="sub">Enter your email to see your assignment.</p>
      <p className="tag" key={tag} aria-live="off">💡 {TAGLINES[tag]}</p>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" inputMode="email" autoComplete="email" autoFocus required
        placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
      <button className="full" disabled={busy}>{busy ? 'Checking permissions…' : 'Continue'}</button>
      {error && (
        <div className={`msg ${error.locked ? 'lock' : ''}`} role="alert">
          {error.text}
          {error.locked && <div className="joke">Rare moment where “Request access” actually works. 😉</div>}
          {!error.locked && error.text === 'Access not available.' && (
            <div className="joke">Even our site owners couldn’t find you in the directory. Check the spelling?</div>
          )}
        </div>
      )}
      <p className="fine">This links your assignment to this device. It can only be opened on one device.<br />
        Permission inheritance has been broken. Permanently. 🔒</p>
      <p className="brand">© SharePoint Designs · Powered by questionable decisions</p>
    </form>
  );
}
