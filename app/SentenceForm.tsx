'use client';
import { useEffect, useState } from 'react';

/** One-shot Tangkhul sentence. Deliberately gives no hint about what the blanks mean: the surprise is the point. */
export default function SentenceForm({ saved }: { saved?: { blank1: string; blank2: string } | null }) {
  const [answer, setAnswer] = useState<{ blank1: string; blank2: string } | null>(saved ?? null);
  // `saved` omitted => load this device's saved answer ourselves (used on the host screen). 'out' = not a registered participant device.
  const [state, setState] = useState<'ready' | 'loading' | 'out'>(saved === undefined ? 'loading' : 'ready');
  useEffect(() => {
    if (saved !== undefined) return;
    fetch('/api/sentence', { cache: 'no-store' }).then(async (r) => {
      if (r.status === 401) return setState('out');
      setAnswer((await r.json()).answer ?? null); setState('ready');
    }).catch(() => setState('ready'));
  }, [saved]);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !a.trim() || !b.trim()) return;
    if (!confirm('Send this answer? You cannot change it afterwards.')) return;
    setBusy(true); setErr('');
    try {
      const r = await fetch('/api/sentence', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ blank1: a, blank2: b }) });
      const d = await r.json();
      if (r.ok || r.status === 409) setAnswer(d.answer); else setErr(d.error ?? 'Something went wrong. Try again.');
    } catch { setErr('Network problem. Try again.'); } finally { setBusy(false); }
  }

  return (
    <section className="sent">
      <h2>✍️ Complete the Tangkhul sentence</h2>
      {state === 'loading' ? <p className="fine">Loading…</p> : state === 'out' ? (
        <p className="fine">This device isn&apos;t signed in as a participant. Open the home page on your own device and enter your email to answer.</p>
      ) : answer ? (
        <>
          <p className="sentline">Iwui aming <b>{answer.blank1}</b> hoya. I <b>{answer.blank2}</b> naona.</p>
          <p className="fine" style={{ marginTop: 6 }}>✅ Sent. It can&apos;t be changed now. Wait for the host to read it out! 😄</p>
        </>
      ) : (
        <form onSubmit={send}>
          <p className="sentline">
            Iwui aming <input aria-label="first blank" value={a} maxLength={100} onChange={(e) => setA(e.target.value)} placeholder="_____" /> hoya.
            {' '}I <input aria-label="second blank" value={b} maxLength={100} onChange={(e) => setB(e.target.value)} placeholder="_____" /> naona.
          </p>
          <p className="fine" style={{ marginTop: 6 }}>Fill both blanks with whatever you think fits. You can send only once.</p>
          <button type="submit" className="full" disabled={busy || !a.trim() || !b.trim()}>{busy ? 'Sending…' : 'Send my answer'}</button>
          {err && <div className="msg" role="alert">{err}</div>}
        </form>
      )}
    </section>
  );
}
