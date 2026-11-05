import { INSTRUCTIONS, INSTRUCTIONS_TITLE } from '../lib/brand';

/** Not secret: shown to everyone, before and after their character is unlocked. */
export default function Rules() {
  return (
    <section className="rules">
      <h2>📋 {INSTRUCTIONS_TITLE}</h2>
      <ol>{INSTRUCTIONS.map((t) => <li key={t}>{t}</li>)}</ol>
    </section>
  );
}
