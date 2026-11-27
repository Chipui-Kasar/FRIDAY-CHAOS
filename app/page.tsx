import { cookies, headers } from "next/headers";
import { after } from "next/server";
import { getSentence, logEvent, loadSession } from "../lib/access";
import { getDb } from "../lib/db";
import { DEVICE_COOKIE } from "../lib/security";
import { EVENT_EMOJI } from "../lib/brand";
import AccessForm from "./AccessForm";
import Reveal from "./Reveal";
import SentenceForm from "./SentenceForm";
import Waiting from "./Waiting";
import Watch from "./Watch";

// Per-visitor (cookie-dependent) => always rendered on the server, never cached or shared.
export const dynamic = "force-dynamic";

export default async function Home() {
  const token = (await cookies()).get(DEVICE_COOKIE)?.value;
  // No cookie => no database call at all: first-time visitors get the form instantly.
  const session = token ? await loadSession(getDb(), token) : null;

  if (session) {
    const h = await headers();
    const meta = {
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      userAgent: h.get("user-agent")?.slice(0, 300) ?? null,
    };
    // Audit log is written after the response is sent, so it adds zero latency.
    const sentence = await getSentence(getDb(), session.participant.id);
    after(() =>
      logEvent(
        getDb(),
        {
          participantId: session.participant.id,
          event: "view_assignment",
          success: true,
        },
        meta,
      ).catch(() => {}),
    );
    return (
      <main>
        <div className="card">
          <span className="emoji">{EVENT_EMOJI}</span>
          <div className="eyebrow">SharePoint Designs presents</div>
          <h1>Hi {session.participant.name.split(" ")[0]}!</h1>
          <p className="sub">
            {session.locked
              ? "Your topic is locked 🔒"
              : "Your extempore topic"}{" "}
            <span className="chip">Shared with: Only you</span>
          </p>
          {session.locked ? (
            <Waiting
              revealAtMs={session.revealAtMs}
              serverNowMs={session.serverNowMs}
            />
          ) : (
            <>
              <Watch />
              <Reveal
                textTa={session.assignmentTa}
                emoji={EVENT_EMOJI}
                text={
                  session.assignment ??
                  "No topic yet. Check back soon."
                }
              />
            </>
          )}
          <SentenceForm
            saved={
              sentence
                ? { blank1: sentence.blank1, blank2: sentence.blank2, blank3: sentence.blank3 }
                : null
            }
          />
          <p className="fine">
            Keep it to yourself till your turn 🤫 · Opened on this device only
            <br />
            Last modified by: Kasar · Version 3.8
          </p>
          <p className="brand">
            © SharePoint Designs · Powered by questionable decisions
          </p>
        </div>
      </main>
    );
  }
  return (
    <main>
      <div className="card">
        <span className="emoji">{EVENT_EMOJI}</span>
        <AccessForm />
      </div>
    </main>
  );
}
