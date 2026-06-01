import { describe, expect, it } from 'vitest';
import {
  applyScorpion,
  canApplyScorpion,
  dealScorpion,
  hasEmptyTableau,
  isScorpionWon,
} from './rules';

describe('scorpion', () => {
  it('deals 37 tableau cards and 15 stock cards', () => {
    const state = dealScorpion(1);
    expect(state.tableau.reduce((n, col) => n + col.length, 0)).toBe(37);
    expect(state.stock.length).toBe(15);
    expect(state.tableau[0].length).toBe(7);
    expect(state.tableau[4].length).toBe(3);
  });

  it('requires king on empty columns', () => {
    const state = dealScorpion(2);
    state.tableau[0] = [];
    state.tableau[1] = [{ suit: 'hearts', rank: 12, faceUp: true }];
    expect(
      canApplyScorpion(state, {
        kind: 'move-cards',
        from: { zone: 'tableau', index: 1 },
        to: { zone: 'tableau', index: 0 },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(false);
    state.tableau[1] = [{ suit: 'hearts', rank: 13, faceUp: true }];
    expect(
      canApplyScorpion(state, {
        kind: 'move-cards',
        from: { zone: 'tableau', index: 1 },
        to: { zone: 'tableau', index: 0 },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(true);
  });

  it('deals stock to the first four columns', () => {
    const state = dealScorpion(3);
    const before = state.stock.length;
    const next = applyScorpion(state, { kind: 'deal-scorpion-stock' });
    expect(next.stock.length).toBe(before - 4);
    expect(next.tableau[0].length).toBe(state.tableau[0].length + 1);
    expect(next.tableau[3].length).toBe(state.tableau[3].length + 1);
    expect(next.tableau[4].length).toBe(state.tableau[4].length);
  });

  it('blocks stock deal when a column is empty', () => {
    const state = dealScorpion(4);
    state.tableau[2] = [];
    expect(hasEmptyTableau(state)).toBe(true);
    expect(canApplyScorpion(state, { kind: 'deal-scorpion-stock' })).toBe(false);
  });

  it('wins after four sequences are cleared', () => {
    const state = dealScorpion(5);
    state.foundations = 4;
    state.tableau = state.tableau.map(() => []);
    expect(isScorpionWon(state)).toBe(true);
  });
});
