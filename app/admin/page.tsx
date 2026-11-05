'use client';
import { EVENT_NAME } from '../../lib/brand';
import { FormEvent, useCallback, useEffect, useState } from 'react';

type Row = { id: string; name: string; email: string; status: string; claimed_at: string | null; revealed_at: string | null; registered_at: string | null; last_accessed_at: string | null; user_agent: string | null; ip_address: string | null };
type Log = { id: string; created_at: string; event: string; success: boolean; detail: string | null; email_attempted: string | null; participant_name: string | null; ip_address: string | null };
type Settings = { revealOpen: boolean; isOpen: boolean; revealAtMs: number | null; serverNowMs: number };
const fmt = (s: string | null) => (s ? new Date(s).toLocaleString() : '—');
const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<'people' | 'logs'>('people');
  const [rows, setRows] = useState<Row[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [when, setWhen] = useState('');

  const load = useCallback(async () => {
    const [o, l] = await Promise.all([fetch('/api/admin/overview'), fetch('/api/admin/logs')]);
    if (o.status === 401 || o.status === 503) { setAuthed(false); if (o.status === 503) setErr('Admin is not configured on the server.'); return; }
    const od = await o.json();
    setRows(od.participants);
    setSettings(od.settings);
    setLogs((await l.json()).logs);
    setAuthed(true);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function login(e: FormEvent) {
    e.preventDefault();
    const r = await post('/api/admin/login', { password: pw });
    if (r.ok) { setPw(''); setErr(''); load(); } else setErr((await r.json()).error);
  }
  async function act(kind: 'reset' | 'revoke', row: Row) {
    const msg = kind === 'reset'
      ? `Reset device access for ${row.name}? Their current device is revoked and the next device to enter their email will claim the assignment.`
      : `Revoke ${row.name}'s device? They will be locked out until you reset access.`;
    if (!confirm(msg)) return;
    const status = kind === 'reset' ? 'reset_pending' : 'revoked';
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r))); // instant; server confirms in background
    post(`/api/admin/${kind}`, { participantId: row.id }).then((r) => { if (!r.ok) load(); }).catch(load);
  }

  async function revealOne(row: Row, revealed: boolean) {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, revealed_at: revealed ? new Date().toISOString() : null } : r)));
    post('/api/admin/reveal', { participantId: row.id, revealed }).then((r) => { if (!r.ok) load(); }).catch(load);
  }
  function setReveal(body: { action: string; at?: string }) {
    // Optimistic: show the new state immediately, then let the server's answer replace it.
    setSettings((st) => {
      if (!st) return st;
      switch (body.action) {
        case 'open': return { ...st, revealOpen: true, isOpen: true };
        case 'close': return { ...st, revealOpen: false, isOpen: false, revealAtMs: null };
        case 'clear_schedule': return { ...st, revealAtMs: null, isOpen: st.revealOpen };
        default: { const t = new Date(body.at!).getTime(); return { ...st, revealOpen: false, revealAtMs: t, isOpen: t <= Date.now() }; }
      }
    });
    if (body.action === 'close') setRows((rs) => rs.map((r) => ({ ...r, revealed_at: null })));
    post('/api/admin/settings', body)
      .then(async (r) => (r.ok ? setSettings((await r.json()).settings) : load()))
      .catch(load);
  }

  if (authed === null) return <main><div className="card"><div className="skel" /></div></main>;
  if (!authed) return (
    <main><form className="card" onSubmit={login}>
      <span className="emoji">🔐</span><h1>Host login</h1><p className="sub">{EVENT_NAME} admin</p>
      <label htmlFor="pw">Password</label>
      <input id="pw" type="password" autoFocus value={pw} onChange={(e) => setPw(e.target.value)} />
      <button className="full">Sign in</button>
      {err && <div className="msg" role="alert">{err}</div>}
    </form></main>
  );

  const claimed = rows.filter((r) => r.status === 'active').length;
  return (
    <main><div className="card wide">
      <div className="bar">
        <div><h1>Host dashboard</h1><p className="sub" style={{ margin: 0 }}>{claimed} of {rows.length} participants have opened their assignment</p></div>
        <div className="tabs">
          <button className={tab === 'people' ? 'on' : ''} onClick={() => setTab('people')}>Participants</button>
          <button className={tab === 'logs' ? 'on' : ''} onClick={() => setTab('logs')}>Access logs</button>
          <button className="ghost" onClick={load}>↻</button>
        </div>
      </div>
      {settings && (
        <div className="panel">
          <div className="row">
            <span>Reveal status:</span>
            <span className={`state ${settings.isOpen ? 'open' : 'locked'}`}>
              {settings.isOpen ? '🔓 OPEN: participants can see their characters'
                : settings.revealAtMs ? `🔒 LOCKED: opens automatically ${new Date(settings.revealAtMs).toLocaleString()}` : '🔒 LOCKED: waiting for you'}
            </span>
          </div>
          <div className="row">
            <button disabled={settings.revealOpen} onClick={() => confirm('Reveal every character to everyone now?') && setReveal({ action: 'open' })}>🔓 Reveal ALL now</button>
            <button className="ghost" disabled={!settings.isOpen && !settings.revealAtMs} onClick={() => confirm('Lock EVERYONE again, cancel any schedule and undo one-by-one reveals? Characters are hidden immediately.') && setReveal({ action: 'close' })}>🔒 Lock all again</button>
          </div>
          <div className="row">
            <label htmlFor="when" style={{ margin: 0 }}>Schedule countdown:</label>
            <input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            <button className="ghost" disabled={!when} onClick={() => setReveal({ action: 'schedule', at: new Date(when).toISOString() })}>Start countdown</button>
            {settings.revealAtMs && !settings.isOpen && <button className="ghost" onClick={() => setReveal({ action: 'clear_schedule' })}>Cancel schedule</button>}
          </div>
        </div>
      )}
      <div className="tbl">
        {tab === 'people' ? (
          <table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Character</th><th>Registered</th><th>Last access</th><th>Device</th><th /></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td><td>{r.email}</td>
                <td><span className={`pill ${r.status}`}>{r.status.replace('_', ' ')}</span></td>
                <td>{settings?.isOpen ? <span className="ok">🔓 all open</span> : r.revealed_at ? <span className="ok">🔓 revealed</span> : <span className="muted">🔒 hidden</span>}</td>
                <td>{fmt(r.registered_at)}</td><td>{fmt(r.last_accessed_at)}</td>
                <td title={r.user_agent ?? ''}>{r.ip_address ?? '—'}</td>
                <td><div className="acts">
                  {r.revealed_at ? (
                    <button className="ghost" disabled={!!settings?.isOpen} onClick={() => revealOne(r, false)}>Hide</button>
                  ) : (
                    <button disabled={!!settings?.isOpen} onClick={() => revealOne(r, true)}>🔓 Reveal</button>
                  )}
                  <button className="danger" disabled={r.status !== 'active'} onClick={() => act('revoke', r)}>Revoke</button>
                  <button className="ghost" disabled={r.status === 'unclaimed' || r.status === 'reset_pending'} onClick={() => act('reset', r)}>Reset access</button>
                </div></td>
              </tr>))}</tbody></table>
        ) : (
          <table><thead><tr><th>Time</th><th>Event</th><th>Result</th><th>Participant</th><th>Email tried</th><th>Detail</th><th>IP</th></tr></thead>
            <tbody>{logs.map((l) => (
              <tr key={l.id}><td>{fmt(l.created_at)}</td><td>{l.event}</td>
                <td className={l.success ? 'ok' : 'bad'}>{l.success ? 'ok' : 'denied'}</td>
                <td>{l.participant_name ?? '—'}</td><td>{l.email_attempted ?? '—'}</td><td>{l.detail ?? ''}</td><td>{l.ip_address ?? '—'}</td></tr>))}</tbody></table>
        )}
      </div>
    </div></main>
  );
}
