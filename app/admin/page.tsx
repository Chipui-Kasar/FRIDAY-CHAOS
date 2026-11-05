'use client';
import { FormEvent, useCallback, useEffect, useState } from 'react';

type Row = { id: string; name: string; email: string; status: string; claimed_at: string | null; registered_at: string | null; last_accessed_at: string | null; user_agent: string | null; ip_address: string | null };
type Log = { id: string; created_at: string; event: string; success: boolean; detail: string | null; email_attempted: string | null; participant_name: string | null; ip_address: string | null };
const fmt = (s: string | null) => (s ? new Date(s).toLocaleString() : '—');
const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });

export default function Admin() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<'people' | 'logs'>('people');
  const [rows, setRows] = useState<Row[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');

  const load = useCallback(async () => {
    const [o, l] = await Promise.all([fetch('/api/admin/overview'), fetch('/api/admin/logs')]);
    if (o.status === 401 || o.status === 503) { setAuthed(false); if (o.status === 503) setErr('Admin is not configured on the server.'); return; }
    setRows((await o.json()).participants);
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
    if (confirm(msg)) { await post(`/api/admin/${kind}`, { participantId: row.id }); load(); }
  }

  if (authed === null) return <main><div className="card"><div className="skel" /></div></main>;
  if (!authed) return (
    <main><form className="card" onSubmit={login}>
      <span className="emoji">🔐</span><h1>Host login</h1><p className="sub">Fun Friday admin</p>
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
      <div className="tbl">
        {tab === 'people' ? (
          <table><thead><tr><th>Name</th><th>Email</th><th>Status</th><th>Registered</th><th>Last access</th><th>Device</th><th /></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td><td>{r.email}</td>
                <td><span className={`pill ${r.status}`}>{r.status.replace('_', ' ')}</span></td>
                <td>{fmt(r.registered_at)}</td><td>{fmt(r.last_accessed_at)}</td>
                <td title={r.user_agent ?? ''}>{r.ip_address ?? '—'}</td>
                <td><div className="acts">
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
