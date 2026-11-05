'use client';
import { useEffect, useState } from 'react';

const SS_REVEALED = 'ff:revealed'; // UI state only; the text itself comes from the server HTML
const safe = <T,>(fn: () => T): T | undefined => { try { return fn(); } catch { return undefined; } };

export default function Reveal({ text }: { text: string }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => { if (safe(() => sessionStorage.getItem(SS_REVEALED) === '1')) setRevealed(true); }, []);
  return (
    <div className={`reveal ${revealed ? '' : 'hidden'}`}>
      <div className="secret" aria-hidden={!revealed}>{text}</div>
      {!revealed && (
        <button onClick={() => { setRevealed(true); safe(() => sessionStorage.setItem(SS_REVEALED, '1')); }}>Tap to reveal</button>
      )}
    </div>
  );
}
