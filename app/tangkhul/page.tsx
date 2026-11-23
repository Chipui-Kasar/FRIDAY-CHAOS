import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getDb } from '../../lib/db';
import { ADMIN_COOKIE, isAdmin } from '../../lib/security';
import TangkhulGame from './TangkhulGame';

export const metadata: Metadata = { title: 'Can you speak Tangkhul?' };
export const dynamic = 'force-dynamic';

/** Host-only: the participant list is loaded automatically, so only a signed-in admin can open this page. */
export default async function Page() {
  const c = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!c || !isAdmin(new Request('http://x', { headers: { cookie: `${ADMIN_COOKIE}=${c}` } }))) {
    return <main><div className="card"><span className="emoji">🔒</span><h1>Host only</h1>
      <p className="sub">Sign in on the <a href="/admin">admin page</a> first, then come back here.</p></div></main>;
  }
  const rows = await getDb().query<{ name: string }>('SELECT name FROM participants WHERE is_active ORDER BY name');
  return <main><div className="card wide"><TangkhulGame initialPlayers={rows.map((r) => r.name)} /></div></main>;
}
