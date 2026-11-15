import { describe, expect, it } from 'vitest';
import { ARCHETYPES, QUESTIONS, QUESTION_COUNT, makeTopic, pickQuestions, scoreAnswers, type TypeKey } from '@/lib/vibe';

// Small deterministic RNG (mulberry32) so failures are reproducible.
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const KEYS = Object.keys(ARCHETYPES) as TypeKey[];

describe('vibe check', () => {
  it('question bank is well formed', () => {
    expect(QUESTIONS.length).toBeGreaterThan(QUESTION_COUNT);
    for (const q of QUESTIONS) {
      expect(q.a).toHaveLength(4);
      for (const a of q.a) expect(KEYS).toContain(a.type);
    }
  });

  it('picks distinct questions and keeps every answer', () => {
    const qs = pickQuestions(seeded(1));
    expect(qs).toHaveLength(QUESTION_COUNT);
    expect(new Set(qs.map((q) => q.q)).size).toBe(QUESTION_COUNT);
    for (const q of qs) expect(q.a).toHaveLength(4);
  });

  it('different people get different question sets', () => {
    const sets = new Set(Array.from({ length: 20 }, (_, i) => pickQuestions(seeded(i)).map((q) => q.q).join('|')));
    expect(sets.size).toBeGreaterThan(10);
  });

  it('scores by majority and breaks ties among leaders only', () => {
    expect(scoreAnswers(['owl', 'owl', 'star', 'napper', 'owl']).key).toBe('owl');
    for (let i = 0; i < 30; i++) expect(['star', 'napper']).toContain(scoreAnswers(['star', 'napper', 'star', 'napper', 'owl'], seeded(i)).key);
    expect(KEYS).toContain(scoreAnswers([]).key);
  });

  it('every type produces non-empty, fully-filled topics with no stray placeholders', () => {
    for (const k of KEYS) for (let i = 0; i < 200; i++) {
      const t = makeTopic(k, seeded(i * 7 + 1));
      expect(t.length).toBeGreaterThan(20);
      expect(t).not.toMatch(/undefined|\$\{|\[object/);
    }
  });

  it('generates plenty of variety and avoids repeating the previous topic', () => {
    const rng = seeded(42);
    const topics = new Set(Array.from({ length: 100 }, () => makeTopic('gremlin', rng)));
    expect(topics.size).toBeGreaterThan(60);
    let prev = makeTopic('foodie', rng);
    for (let i = 0; i < 100; i++) { const next = makeTopic('foodie', rng, prev); expect(next).not.toBe(prev); prev = next; }
  });
});
