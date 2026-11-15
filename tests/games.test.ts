import { describe, expect, it } from 'vitest';
import {
  GAMES, HOT_TAKES, INTERVIEW, MUST_INCLUDE, RATHER, SCENARIOS, makeExcuse, makeHotTake, makeIdentity, makeTwist, nextQuestion, ratherDeck,
} from '@/lib/games';

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

describe('party games', () => {
  it('menu has unique ids and all five games', () => {
    expect(GAMES.map((g) => g.id).sort()).toEqual(['excuse', 'hottake', 'identity', 'rather', 'vibe']);
  });

  it('identities are complete and the twist is always a different person', () => {
    for (let i = 0; i < 200; i++) {
      const r = seeded(i);
      const me = makeIdentity(r);
      for (const v of Object.values(me)) expect(v.length).toBeGreaterThan(3);
      const tw = makeTwist(me, r);
      expect(tw.name !== me.name || tw.job !== me.job).toBe(true);
    }
  });

  it('never repeats the previous question / hot take / excuse when asked not to', () => {
    const r = seeded(9);
    let q = INTERVIEW[0]; let h = HOT_TAKES[0]; let s = SCENARIOS[0];
    for (let i = 0; i < 100; i++) {
      const nq = nextQuestion(r, q); expect(nq).not.toBe(q); q = nq;
      const nh = makeHotTake(r, h).statement; expect(nh).not.toBe(h); h = nh;
      const ns = makeExcuse(r, s).scenario; expect(ns).not.toBe(s); s = ns;
    }
  });

  it('hot takes get both stances and excuses use a known required word', () => {
    const stances = new Set(Array.from({ length: 60 }, (_, i) => makeHotTake(seeded(i * 3)).stance));
    expect(stances).toEqual(new Set(['FOR', 'AGAINST']));
    expect(MUST_INCLUDE).toContain(makeExcuse(seeded(1)).include);
  });

  it('would-you-rather deck contains every pair exactly once, shuffled', () => {
    const d = ratherDeck(seeded(5));
    expect(d).toHaveLength(RATHER.length);
    expect(new Set(d.map((p) => p.join('|'))).size).toBe(RATHER.length);
    expect(d.every(([a, b]) => a && b && a !== b)).toBe(true);
  });
});
