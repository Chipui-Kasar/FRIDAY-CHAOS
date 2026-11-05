import { beforeEach, describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import type { Db } from '@/lib/db';
import { LIMITS, LOCKED_MESSAGE, UNAVAILABLE_MESSAGE } from '@/lib/handlers';
import { A, B, Browser, freshDb, idOf } from './helpers';

let db: Db;
beforeEach(async () => {
  db = await freshDb();
});

describe('first-device registration', () => {
  it('registers the first device for a registered email (normalised) with a secure cookie, storing only the hash', async () => {
    const ada = new Browser();
    const r = await ada.access('  ADA@Example.COM ');
    expect(r.status).toBe(200);
    const cookie = r.setCookie[0];
    expect(cookie).toMatch(/HttpOnly/);
    expect(cookie).toMatch(/Secure/);
    expect(cookie).toMatch(/SameSite=Lax/);
    const token = ada.jar.get('ff_device')!;
    const rows = await db.query<{ device_token_hash: string }>(`SELECT device_token_hash FROM participant_device_access`);
    expect(rows).toHaveLength(1);
    expect(rows[0].device_token_hash).toBe(createHash('sha256').update(token).digest('hex'));
    expect(JSON.stringify(rows)).not.toContain(token);
    const [a] = await db.query<any>(`SELECT claimed_at, claimed_participant_id FROM assignments WHERE participant_id=$1`, [await idOf(db, A.email)]);
    expect(a.claimed_at).toBeTruthy();
    expect(a.claimed_participant_id).toBe(await idOf(db, A.email));
    expect((await ada.assignment()).json.assignment).toBe(A.assignment);
  });

  it('rejects an unregistered email with a generic message and no cookie', async () => {
    const x = new Browser();
    const r = await x.access('stranger@example.com');
    expect(r.status).toBe(403);
    expect(r.json.error).toBe(UNAVAILABLE_MESSAGE);
    expect(r.setCookie).toHaveLength(0);
    expect(await db.query(`SELECT 1 FROM participant_device_access`)).toHaveLength(0);
  });

  it('denies a second device once the first has claimed access', async () => {
    await new Browser().access(A.email);
    const other = new Browser('10.0.0.2');
    const r = await other.access(A.email);
    expect(r.status).toBe(403);
    expect(r.json.error).toBe(LOCKED_MESSAGE);
    expect(other.jar.size).toBe(0);
    expect((await other.assignment()).status).toBe(401);
  });

  it('lets the registered device re-enter its email without a new registration', async () => {
    const ada = new Browser();
    await ada.access(A.email);
    const token = ada.jar.get('ff_device');
    expect((await ada.access(A.email)).status).toBe(200);
    expect(ada.jar.get('ff_device')).toBe(token);
  });

  it('does not let one device claim a second identity', async () => {
    const shared = new Browser();
    await shared.access(A.email);
    const r = await shared.access(B.email);
    expect(r.status).toBe(403);
    expect(await db.query(`SELECT 1 FROM participant_device_access`)).toHaveLength(1);
  });

  it('cannot create duplicate registrations from concurrent requests', async () => {
    const browsers = Array.from({ length: 8 }, (_, i) => new Browser(`10.1.0.${i}`));
    const results = await Promise.all(browsers.map((b) => b.access(A.email)));
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
    expect(results.filter((r) => r.status === 403)).toHaveLength(7);
    expect(await db.query(`SELECT 1 FROM participant_device_access`)).toHaveLength(1);
    const winner = browsers[results.findIndex((r) => r.status === 200)];
    expect((await winner.assignment()).json.assignment).toBe(A.assignment);
  });

  it('the database itself refuses a second row for a participant', async () => {
    await new Browser().access(A.email);
    await expect(
      db.query(`INSERT INTO participant_device_access (participant_id, device_token_hash) VALUES ($1, repeat('a',64))`, [await idOf(db, A.email)]),
    ).rejects.toThrow();
  });

  it('claimed_at is permanent', async () => {
    await new Browser().access(A.email);
    await expect(db.query(`UPDATE assignments SET claimed_at = NULL, claimed_participant_id = NULL`)).rejects.toThrow();
  });
});

describe('client storage is not an authority', () => {
  it('changing/forging email in localStorage (sent as headers/params) grants nothing', async () => {
    await new Browser().access(B.email);
    const attacker = new Browser('10.0.0.9');
    const r = await attacker.assignment(`/api/assignment?email=${B.email}`, { 'x-participant-email': B.email });
    expect(r.status).toBe(401);
    expect(JSON.stringify(r.json)).not.toContain(B.assignment);
  });

  it('clearing localStorage does not bypass the lock (server only looks at the cookie)', async () => {
    const ada = new Browser();
    await ada.access(A.email);
    // localStorage cleared => the client simply re-asks; cookie still identifies the device.
    expect((await ada.assignment()).json.assignment).toBe(A.assignment);
    // and a different device with empty storage is still locked out
    expect((await new Browser('10.0.0.5').access(A.email)).status).toBe(403);
  });

  it('clearing cookies blocks access until an admin resets the device', async () => {
    const ada = new Browser();
    await ada.access(A.email);
    ada.jar.clear();
    expect((await ada.assignment()).status).toBe(401);
    expect((await ada.access(A.email)).json.error).toBe(LOCKED_MESSAGE);
  });

  it('a garbage or forged device cookie is rejected', async () => {
    const x = new Browser();
    x.jar.set('ff_device', 'A'.repeat(43));
    expect((await x.assignment()).status).toBe(401);
    x.jar.set('ff_device', "' OR 1=1 --");
    expect((await x.assignment()).status).toBe(401);
  });

  it('participant IDs in URL, headers or body never reveal another assignment', async () => {
    const ada = new Browser();
    const bob = new Browser('10.0.0.2');
    await ada.access(A.email);
    await bob.access(B.email);
    const bobId = await idOf(db, B.email);
    for (const [path, headers] of [
      [`/api/assignment?participantId=${bobId}`, {}],
      [`/api/assignment?id=${bobId}&email=${B.email}`, {}],
      ['/api/assignment', { 'x-participant-id': bobId }],
    ] as const) {
      const r = await ada.assignment(path, headers as any);
      expect(r.json.assignment).toBe(A.assignment);
      expect(JSON.stringify(r.json)).not.toContain(B.assignment);
    }
    // there is no route that accepts an id
    const post = await ada.call(async (req) => (await import('@/lib/handlers')).handleAssignment(req), '/api/assignment', { body: { participantId: bobId } });
    expect(post.json.assignment).toBe(A.assignment);
  });
});

describe('admin', () => {
  it('requires admin auth for every admin endpoint', async () => {
    const x = new Browser();
    const id = await idOf(db, A.email);
    expect((await x.overview()).status).toBe(401);
    expect((await x.logs()).status).toBe(401);
    expect((await x.reset(id)).status).toBe(401);
    expect((await x.revoke(id)).status).toBe(401);
    expect((await x.adminLogin('wrong')).status).toBe(401);
    x.jar.set('ff_admin', '99999999999.forged');
    expect((await x.overview()).status).toBe(401);
  });

  it('shows participants, statuses, times and logs without exposing assignment content', async () => {
    await new Browser().access(A.email);
    const host = new Browser('10.9.9.9');
    await host.adminLogin();
    const { json } = await host.overview();
    const ada = json.participants.find((p: any) => p.email === A.email);
    const bob = json.participants.find((p: any) => p.email === B.email);
    expect(ada.status).toBe('active');
    expect(ada.registered_at && ada.last_accessed_at && ada.claimed_at).toBeTruthy();
    expect(bob.status).toBe('unclaimed');
    expect(JSON.stringify(json)).not.toContain(A.assignment);
    expect((await host.logs()).json.logs.some((l: any) => l.event === 'register' && l.success)).toBe(true);
  });

  it('revoked tokens cannot access assignments, and revoke alone does not allow re-registration', async () => {
    const ada = new Browser();
    await ada.access(A.email);
    const host = new Browser('10.9.9.9');
    await host.adminLogin();
    await host.revoke(await idOf(db, A.email));
    expect((await ada.assignment()).status).toBe(401);
    expect((await new Browser('10.0.0.7').access(A.email)).json.error).toBe(LOCKED_MESSAGE);
    expect((await ada.access(A.email)).json.error).toBe(LOCKED_MESSAGE);
  });

  it('reset revokes the old token and allows exactly one new registration', async () => {
    const oldDevice = new Browser();
    await oldDevice.access(A.email);
    const oldToken = oldDevice.jar.get('ff_device')!;
    const host = new Browser('10.9.9.9');
    await host.adminLogin();
    expect((await host.reset(await idOf(db, A.email))).json.changed).toBe(true);

    expect((await oldDevice.assignment()).status).toBe(401);

    const newDevice = new Browser('10.0.0.3');
    expect((await newDevice.access(A.email)).status).toBe(200);
    expect(newDevice.jar.get('ff_device')).not.toBe(oldToken);
    expect((await newDevice.assignment()).json.assignment).toBe(A.assignment);

    // old token stays dead even if replayed; third device is locked again
    const replay = new Browser();
    replay.jar.set('ff_device', oldToken);
    expect((await replay.assignment()).status).toBe(401);
    expect((await new Browser('10.0.0.4').access(A.email)).status).toBe(403);
    expect(await db.query(`SELECT 1 FROM participant_device_access`)).toHaveLength(1);

    // claim record survived the reset
    const [a] = await db.query<any>(`SELECT claimed_at FROM assignments WHERE participant_id=$1`, [await idOf(db, A.email)]);
    expect(a.claimed_at).toBeTruthy();
  });

  it('concurrent registrations after a reset still yield a single winner', async () => {
    await new Browser().access(A.email);
    const host = new Browser('10.9.9.9');
    await host.adminLogin();
    await host.reset(await idOf(db, A.email));
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => new Browser(`10.2.0.${i}`).access(A.email)));
    expect(results.filter((r) => r.status === 200)).toHaveLength(1);
  });
});

describe('hardening', () => {
  it('rate-limits email lookups', async () => {
    const x = new Browser();
    let last = 0;
    for (let i = 0; i <= LIMITS.emailPerWindow; i++) last = (await x.access('stranger@example.com')).status;
    expect(last).toBe(429);
  });

  it('rejects non-JSON bodies on mutating routes', async () => {
    const x = new Browser();
    const r = await x.call((await import('@/lib/handlers')).handleAccess, '/api/access', {
      method: 'POST', body: 'x', headers: { 'content-type': 'text/plain' },
    });
    expect(r.status).toBe(400);
  });

  it('logs failed lookups for the host to see', async () => {
    await new Browser().access('nobody@example.com');
    const rows = await db.query<any>(`SELECT * FROM access_logs WHERE detail='not_registered'`);
    expect(rows).toHaveLength(1);
    expect(rows[0].email_attempted).toBe('nobody@example.com');
  });
});
