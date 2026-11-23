import { beforeEach, describe, expect, it } from 'vitest';
import type { Db } from '@/lib/db';
import { A, B, Browser, freshDb, idOf } from './helpers';

let db: Db;
let ada: Browser;
let bob: Browser;
let host: Browser;
beforeEach(async () => {
  db = await freshDb({ revealOpen: false });
  ada = new Browser('10.0.0.1');
  bob = new Browser('10.0.0.2');
  host = new Browser('10.9.9.9');
  await host.adminLogin();
  await ada.access(A.email);
  await bob.access(B.email);
});

describe('tangkhul sentence', () => {
  it('requires a signed-in device', async () => {
    expect((await new Browser().sentence({ blank1: 'x', blank2: 'y' })).status).toBe(401);
  });

  it('saves one answer, trims it, and rejects empty or oversize input', async () => {
    expect((await ada.sentence({ blank1: '', blank2: 'y' })).status).toBe(400);
    expect((await ada.sentence({ blank1: 'x'.repeat(101), blank2: 'y' })).status).toBe(400);
    expect((await ada.sentence({ blank1: 1, blank2: 'y' })).status).toBe(400);
    const r = await ada.sentence({ blank1: '  Pizza   Man ', blank2: 'Mars' });
    expect(r.status).toBe(200);
    expect(r.json.answer).toMatchObject({ blank1: 'Pizza Man', blank2: 'Mars' });
    expect((await ada.sentence()).json.answer).toMatchObject({ blank1: 'Pizza Man' });
  });

  it('cannot be edited after sending (API and database)', async () => {
    await ada.sentence({ blank1: 'First', blank2: 'One' });
    const again = await ada.sentence({ blank1: 'Second', blank2: 'Two' });
    expect(again.status).toBe(409);
    expect(again.json.answer).toMatchObject({ blank1: 'First', blank2: 'One' });
    await expect(db.query(`UPDATE sentence_responses SET blank1 = 'hack'`)).rejects.toThrow();
  });

  it('is private per person and visible to the admin only', async () => {
    await ada.sentence({ blank1: 'Potato', blank2: 'Moon' });
    expect((await bob.sentence()).json.answer).toBeNull();
    expect((await bob.adminSentences()).status).toBe(401);
    const r = await host.adminSentences();
    expect(r.status).toBe(200);
    const rows = r.json.sentences as { name: string; blank1: string | null }[];
    expect(rows.find((x) => x.name === A.name)?.blank1).toBe('Potato');
    expect(rows.find((x) => x.name === B.name)?.blank1).toBeNull();
  });

  it('is deleted with the participant', async () => {
    await ada.sentence({ blank1: 'a', blank2: 'b' });
    await db.query(`DELETE FROM participants WHERE id = $1`, [await idOf(db, A.email)]);
    expect(await db.query(`SELECT 1 FROM sentence_responses`)).toHaveLength(0);
  });
});
