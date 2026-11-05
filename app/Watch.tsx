'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

/**
 * Rendered while a character is visible. Polls a tiny status endpoint so that if the host hides or locks
 * this person again, the page re-renders (server decides) and the character disappears without a reload.
 */
export default function Watch() {
  const router = useRouter();
  const busy = useRef(false);
  useEffect(() => {
    const check = async () => {
      if (busy.current) return;
      busy.current = true;
      try {
        const d = await (await fetch('/api/status', { cache: 'no-store' })).json();
        if (d.locked || !d.signedIn) router.refresh();
      } catch { /* offline: retry on next tick */ } finally { busy.current = false; }
    };
    const poll = setInterval(() => { if (!document.hidden) check(); }, 5000);
    const onVis = () => { if (!document.hidden) check(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(poll); document.removeEventListener('visibilitychange', onVis); };
  }, [router]);
  return null;
}
