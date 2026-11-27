import type { Metadata } from 'next';
import { getDb } from '../../lib/db';
import { hasAdminSession } from '../../lib/adminGate';
import SentenceForm from '../SentenceForm';
import TangkhulGame from './TangkhulGame';

export const metadata: Metadata = { title: 'Can you speak Tangkhul?' };
export const dynamic = 'force-dynamic';

/**
 * Public: Fill in the blank (each person types their own answer).
 * Admin only: Learn Tangkhul + the scoreboard. Non-admins never get that code or the participant names,
 * because the admin game is a separate client component that is only rendered for an admin session.
 */
export default async function Page() {
  if (await hasAdminSession()) {
    const rows = await getDb().query<{ name: string }>('SELECT name FROM participants WHERE is_active ORDER BY name');
    return <main><div className="card wide"><TangkhulGame initialPlayers={rows.map((r) => r.name)} /></div></main>;
  }
  return (
    <main><div className="card">
      <span className="emoji">🏔️</span>
      <h1>Can you speak Tangkhul?</h1>
      <p className="sub">Type your answer in the blanks and send it. You can send only once.</p>
      <SentenceForm />
    </div></main>
  );
}
