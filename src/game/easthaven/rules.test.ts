import { describe, expect, it } from 'vitest';
import { applyEasthaven, canApplyEasthaven, dealEasthaven, isEasthavenWon } from './rules';

describe('easthaven', () => {
  it('deals 28 to tableau and 24 to stock', () => {
    const state = dealEasthaven(1);
    const inTableau = state.tableau.reduce((n, col) => n + col.length, 0);
    expect(inTableau).toBe(28);
    expect(state.stock.length).toBe(24);
    expect(state.hasRecycled).toBe(false);
  });

  it('builds tableau down in same suit only', () => {
    const state = dealEasthaven(2);
    state.tableau[0] = [{ suit: 'hearts', rank: 12, faceUp: true }];
    state.tableau[1] = [{ suit: 'hearts', rank: 13, faceUp: true }];
    const legal = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: 0 },
      to: { zone: 'tableau' as const, index: 1 },
      fromIndex: 0,
      count: 1,
    };
    expect(canApplyEasthaven(state, legal)).toBe(true);

    state.tableau[0] = [{ suit: 'spades', rank: 12, faceUp: true }];
    expect(canApplyEasthaven(state, legal)).toBe(false);
  });

  it('allows only single-card moves', () => {
    const state = dealEasthaven(3);
    state.tableau[0] = [
      { suit: 'clubs', rank: 13, faceUp: true },
      { suit: 'clubs', rank: 12, faceUp: true },
    ];
    state.tableau[1] = [];
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: 0 },
      to: { zone: 'tableau' as const, index: 1 },
      fromIndex: 0,
      count: 2,
    };
    expect(canApplyEasthaven(state, action)).toBe(false);
  });

  it('allows one recycle of the waste pile', () => {
    let state = dealEasthaven(4);
    while (state.stock.length > 0) {
      state = applyEasthaven(state, { kind: 'flip-stock' });
    }
    expect(canApplyEasthaven(state, { kind: 'recycle-waste' })).toBe(true);
    state = applyEasthaven(state, { kind: 'recycle-waste' });
    expect(state.hasRecycled).toBe(true);
    expect(canApplyEasthaven(state, { kind: 'recycle-waste' })).toBe(false);
  });

  it('detects win when foundations are full', () => {
    const state = dealEasthaven(5);
    expect(isEasthavenWon({ ...state, foundations: { ...state.foundations, hearts: Array.from({ length: 13 }) } })).toBe(
      false,
    );
    expect(
      isEasthavenWon({
        ...state,
        foundations: {
          hearts: Array.from({ length: 13 }),
          diamonds: Array.from({ length: 13 }),
          clubs: Array.from({ length: 13 }),
          spades: Array.from({ length: 13 }),
        },
      }),
    ).toBe(true);
  });
});
