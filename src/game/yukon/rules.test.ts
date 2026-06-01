import { describe, expect, it } from 'vitest';
import { canApplyYukon, dealYukon, isYukonWon } from './rules';

describe('yukon', () => {
  it('deals all 52 cards face up on the tableau', () => {
    const state = dealYukon(1);
    const total = state.tableau.reduce((n, col) => n + col.length, 0);
    expect(total).toBe(52);
    expect(state.tableau.every((col) => col.every((c) => c.faceUp))).toBe(true);
    expect(state.tableau[0].length).toBe(1);
    expect(state.tableau[1].length).toBe(6);
    expect(state.tableau[6].length).toBe(11);
  });

  it('allows moving a non-sequential face-up group when the bottom card attaches', () => {
    const state = dealYukon(2);
    state.tableau[0] = [
      { suit: 'spades', rank: 11, faceUp: true },
      { suit: 'diamonds', rank: 7, faceUp: true },
    ];
    state.tableau[1] = [{ suit: 'hearts', rank: 12, faceUp: true }];
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: 0 },
      to: { zone: 'tableau' as const, index: 1 },
      fromIndex: 0,
      count: 2,
    };
    expect(canApplyYukon(state, action)).toBe(true);
  });

  it('rejects illegal alternating build', () => {
    const state = dealYukon(3);
    state.tableau[0] = [{ suit: 'spades', rank: 10, faceUp: true }];
    state.tableau[1] = [{ suit: 'clubs', rank: 9, faceUp: true }];
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: 0 },
      to: { zone: 'tableau' as const, index: 1 },
      fromIndex: 0,
      count: 1,
    };
    expect(canApplyYukon(state, action)).toBe(false);
  });

  it('detects win when foundations are full', () => {
    const state = dealYukon(4);
    expect(isYukonWon(state)).toBe(false);
    const won = {
      ...state,
      foundations: {
        hearts: Array.from({ length: 13 }),
        diamonds: Array.from({ length: 13 }),
        clubs: Array.from({ length: 13 }),
        spades: Array.from({ length: 13 }),
      },
    } as ReturnType<typeof dealYukon>;
    expect(isYukonWon(won)).toBe(true);
  });
});
