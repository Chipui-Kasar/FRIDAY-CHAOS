import { cookies, headers } from 'next/headers';
import { after } from 'next/server';
import { logEvent, loadSession } from '../lib/access';
import { getDb } from '../lib/db';
import { DEVICE_COOKIE } from '../lib/security';
import { EVENT_EMOJI, emojiFor } from '../lib/brand';
import AccessForm from './AccessForm';
import Reveal from './Reveal';
import Rules from './Rules';
import Waiting from './Waiting';
import Watch from './Watch';

// Per-visitor (cookie-dependent) => always rendered on the server, never cached or shared.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const token = (await cookies()).get(DEVICE_COOKIE)?.value;
  // No cookie => no database call at all: first-time visitors get the form instantly.
  const session = token ? await loadSession(getDb(), token) : null;

  if (session) {
    const h = await headers();
    const meta = { ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null, userAgent: h.get('user-agent')?.slice(0, 300) ?? null };
    // Audit log is written after the response is sent, so it adds zero latency.
    after(() => logEvent(getDb(), { participantId: session.participant.id, event: 'view_assignment', success: true }, meta).catch(() => {}));
    return (
      <main><div className="card">
        <span className="emoji">{EVENT_EMOJI}</span>
        <div className="eyebrow">SharePoint Designs presents</div>
        <h1>Hi {session.participant.name.split(' ')[0]}!</h1>
        <p className="sub">{session.locked ? 'Your assignment is locked 🔒' : 'Your Friday assignment'} <span className="chip">Shared with: Only you</span></p>
        {session.locked ? (
          <Waiting revealAtMs={session.revealAtMs} serverNowMs={session.serverNowMs} />
        ) : (
        <><Watch /><Reveal emoji={emojiFor(session.assignment ?? '')} text={session.assignment ?? 'Nothing assigned yet — check back soon.'} /></>
        )}
        <Rules />
        <p className="fine">Keep it secret 🤫 · Opened on this device only<br />
        Last modified by: Fate · Version 1.0 (no version history, sorry)</p>
        <p className="brand">© SharePoint Designs · Powered by questionable decisions</p>
      </div></main>
    );
  }
  return <main><div className="card"><span className="emoji">{EVENT_EMOJI}</span><AccessForm /></div></main>;
}
