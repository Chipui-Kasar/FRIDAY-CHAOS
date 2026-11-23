import { describe, expect, it } from 'vitest';
import { THINGS, pickThings, swapThings } from '@/lib/heist';

describe('look-and-remember objects', () => {
  it('has enough unique objects for the biggest round plus swaps', () => {
    expect(new Set(THINGS.map((t) => t.n)).size).toBe(THINGS.length);
    expect(THINGS.length).toBeGreaterThanOrEqual(25 + 3);
  });
  it('picks n different objects', () => {
    for (const n of [15, 20, 25]) {
      const l = pickThings(n);
      expect(l).toHaveLength(n);
      expect(new Set(l.map((t) => t.n)).size).toBe(n);
    }
  });
  it('swaps exactly 3 with objects that were not on the list', () => {
    const l = pickThings(20);
    const { updated, changed, removed } = swapThings(l, 3);
    expect(changed).toHaveLength(3);
    expect(updated).toHaveLength(20);
    expect(new Set(updated.map((t) => t.n)).size).toBe(20);
    changed.forEach((i, j) => { expect(updated[i].n).not.toBe(l[i].n); expect(removed[j].n).toBe(l[i].n); expect(l.some((t) => t.n === updated[i].n)).toBe(false); });
    updated.forEach((t, i) => { if (!changed.includes(i)) expect(t).toEqual(l[i]); });
  });
});

import { objectsSpelling, secretWord } from '@/lib/heist';
describe('hidden word objects', () => {
  it('cleans names', () => {
    expect(secretWord('Aarthi K')).toBe('AARTHI');
    expect(secretWord('  Johnsi Jayasingh')).toBe('JOHNSI');
  });
  it('spells the word with first letters, no repeats', () => {
    const l = objectsSpelling('AJITH')!;
    expect(l.map((t) => t.n[0].toUpperCase()).join('')).toBe('AJITH');
    expect(new Set(l.map((t) => t.n)).size).toBe(5);
  });
  it('can spell every participant first name and SHAREPOINT, many times over', () => {
    const words = ['AARTHI', 'AGALYA', 'AJITH', 'ANISH', 'BHARATH', 'CHIPUI', 'JAMAL', 'JOHNSI', 'NIVETHA', 'PRADEEPKUMAR', 'RAMYA', 'RAZIA', 'RUTRAMUGESH', 'SARAT', 'SHANTHAKUMAR', 'SWETHA', 'VENKATMARAN', 'SHAREPOINT'];
    for (const w of words) for (let i = 0; i < 30; i++) expect(objectsSpelling(w), w).not.toBeNull();
  });
});
