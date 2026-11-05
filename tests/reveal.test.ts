import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '@/lib/db';
import { loadSession } from '@/lib/access';
import { A, B, Browser, freshDb, idOf } from './helpers';

let db: Db;
let ada: Browser;
let host: Browser;
beforeEach(async () => {
  db = await freshDb({ revealOpen: false }); // default for a fresh deployment: LOCKED
  ada = new Browser();
  host = new Browser('10.9.9.9');
  await host.adminLogin();
  await ada.access(A.email); // registering the device is allowed before the reveal
});

describe('reveal lock', () => {
  it('is locked by default and the assignment text is never sent', async () => {
    const r = await ada.assignment();
    expect(r.status).toBe(200);
    expect(r.json.locked).toBe(true);
    expect(r.json.assignment).toBeNull();
    expect(JSON.stringify(r.json)).not.toContain(A.assignment);
    const s = await loadSession(db, ada.jar.get('ff_device'));
    expect(s?.locked).toBe(true);
    expect(s?.assignment).toBeNull();
    expect(s?.revealAtMs).toBeNull();
  });

  it('host "open" reveals to everyone; "close" hides again', async () => {
    await host.settings({ action: 'open' });
    expect((await ada.assignment()).json.assignment).toBe(A.assignment);
    await host.settings({ action: 'close' });
    const r = await ada.assignment();
    expect(r.json.locked).toBe(true);
    expect(r.json.assignment).toBeNull();
  });

  it('a future schedule stays locked and exposes the target time using the server clock', async () => {
    const at = new Date(Date.now() + 60 * 60 * 1000);
    await host.settings({ action: 'schedule', at: at.toISOString() });
    const r = await ada.assignment();
    expect(r.json.locked).toBe(true);
    expect(r.json.assignment).toBeNull();
    expect(r.json.revealAtMs).toBe(at.getTime());
    expect(Math.abs(r.json.serverNowMs - Date.now())).toBeLessThan(5000);
  });

  it('a schedule in the past opens automatically, with no host action', async () => {
    await host.settings({ action: 'schedule', at: new Date(Date.now() - 1000).toISOString() });
    expect((await ada.assignment()).json.assignment).toBe(A.assignment);
  });

  it('cancelling a schedule locks again; close also clears it', async () => {
    await host.settings({ action: 'schedule', at: new Date(Date.now() - 1000).toISOString() });
    await host.settings({ action: 'clear_schedule' });
    expect((await ada.assignment()).json.locked).toBe(true);
    await host.settings({ action: 'schedule', at: new Date(Date.now() - 1000).toISOString() });
    await host.settings({ action: 'close' });
    expect((await ada.assignment()).json.locked).toBe(true);
  });

  it('only the host can change it, and bad input is rejected', async () => {
    const stranger = new Browser('10.8.8.8');
    expect((await stranger.settings({ action: 'open' })).status).toBe(401);
    expect((await ada.settings({ action: 'open' })).status).toBe(401);
    expect((await ada.assignment()).json.locked).toBe(true);
    expect((await host.settings({ action: 'schedule', at: 'not-a-date' })).status).toBe(400);
    expect((await host.settings({ action: 'explode' })).status).toBe(400);
  });

  it('the device lock still applies while locked', async () => {
    await host.settings({ action: 'open' });
    expect((await new Browser('10.0.0.5').assignment()).status).toBe(401);
  });

  it('admin overview reports the reveal state and changes are logged', async () => {
    const at = new Date(Date.now() + 3600_000);
    await host.settings({ action: 'schedule', at: at.toISOString() });
    const o = (await host.overview()).json.settings;
    expect(o.isOpen).toBe(false);
    expect(o.revealAtMs).toBe(at.getTime());
    expect((await host.logs()).json.logs.some((l: any) => l.event === 'admin_settings')).toBe(true);
  });
});

describe('reveal one person at a time', () => {
  it('reveals only that person; others stay locked', async () => {
    const bob = new Browser('10.0.0.2');
    await bob.access(B.email);
    expect((await host.revealPerson(await idOf(db, A.email))).json.changed).toBe(true);
    const a = await ada.assignment();
    expect(a.json.locked).toBe(false);
    expect(a.json.assignment).toBe(A.assignment);
    const b = await bob.assignment();
    expect(b.json.locked).toBe(true);
    expect(JSON.stringify(b.json)).not.toContain(B.assignment);
    expect(JSON.stringify(b.json)).not.toContain(A.assignment);
  });

  it('can hide that person again', async () => {
    const id = await idOf(db, A.email);
    await host.revealPerson(id);
    await host.revealPerson(id, false);
    const r = await ada.assignment();
    expect(r.json.locked).toBe(true);
    expect(r.json.assignment).toBeNull();
  });

  it('revealing someone does not let a different device see it', async () => {
    await host.revealPerson(await idOf(db, A.email));
    expect((await new Browser('10.0.0.5').assignment()).status).toBe(401);
  });

  it('"reveal all" still works, and "lock all" also undoes individual reveals', async () => {
    await host.revealPerson(await idOf(db, A.email));
    await host.settings({ action: 'close' });
    expect((await ada.assignment()).json.locked).toBe(true);
    await host.settings({ action: 'open' });
    expect((await ada.assignment()).json.assignment).toBe(A.assignment);
  });

  it('is host-only, validates input, shows in overview and logs', async () => {
    const id = await idOf(db, A.email);
    expect((await ada.revealPerson(id)).status).toBe(401);
    expect((await new Browser('10.8.8.8').revealPerson(id)).status).toBe(401);
    expect((await ada.assignment()).json.locked).toBe(true);
    expect((await host.call((await import('@/lib/handlers')).handleAdminReveal, '/api/admin/reveal', { body: { participantId: 'nope', revealed: true } })).status).toBe(400);
    await host.revealPerson(id);
    const row = (await host.overview()).json.participants.find((p: any) => p.email === A.email);
    expect(row.revealed_at).toBeTruthy();
    expect((await host.logs()).json.logs.some((l: any) => l.event === 'admin_reveal_person' && l.success)).toBe(true);
  });
});

describe('status poll', () => {
  it('reports locked/unlocked without ever returning the text', async () => {
    const { GET } = await import('../app/api/status/route');
    const poll = async (b: Browser) => {
      const res = await GET(new Request('http://localhost/api/status', { headers: { cookie: [...b.jar].map(([k, v]) => `${k}=${v}`).join('; ') } }));
      return res.json();
    };
    expect(await poll(ada)).toEqual({ locked: true, signedIn: true });
    await host.revealPerson(await idOf(db, A.email));
    const d = await poll(ada);
    expect(d.locked).toBe(false);
    expect(JSON.stringify(d)).not.toContain(A.assignment);
    expect((await poll(new Browser())).signedIn).toBe(false);
  });
});
