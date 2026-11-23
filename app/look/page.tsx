import type { Metadata } from 'next';
import { getDb } from '../../lib/db';
import { hasAdminSession } from '../../lib/adminGate';
import LookGame from './LookGame';

// Neutral title on purpose: the players must not know what this round is about.
export const metadata: Metadata = { title: 'Look carefully' };
export const dynamic = 'force-dynamic';

/** Host-only: the objects and answers must stay hidden from players. */
export default async function Page() {
  if (!(await hasAdminSession())) {
    return <main><div className="card"><span className="emoji">🔒</span><h1>Host only</h1>
      <p className="sub">Sign in on the <a href="/admin">admin page</a> first, then come back here.</p></div></main>;
  }
  const rows = await getDb().query<{ name: string }>('SELECT name FROM participants WHERE is_active ORDER BY name');
  return <main><div className="card wide"><LookGame names={rows.map((r) => r.name)} /></div></main>;
}
