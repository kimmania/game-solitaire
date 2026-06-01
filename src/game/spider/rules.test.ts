import { describe, expect, it } from 'vitest';
import { applySpider, canApplySpider, dealSpider, isSpiderWon } from './rules';

describe('spider', () => {
  it('deals 1-suit with all spades', () => {
    const state = dealSpider('spider', 1);
    expect(state.suitMode).toBe(1);
    const inTableau = state.tableau.reduce((n, col) => n + col.length, 0);
    expect(inTableau).toBe(54);
    expect(state.stock.length).toBe(50);
    expect(state.tableau.every((col) => col.every((c) => c.suit === 'spades'))).toBe(true);
  });

  it('deals 2-suit with only spades and hearts', () => {
    const state = dealSpider('spider-2', 10);
    expect(state.suitMode).toBe(2);
    const suits = new Set(
      [...state.tableau.flat(), ...state.stock].map((c) => c.suit),
    );
    expect(suits.has('spades')).toBe(true);
    expect(suits.has('hearts')).toBe(true);
    expect(suits.size).toBe(2);
  });

  it('deals 4-suit with all four suits', () => {
    const state = dealSpider('spider-4', 11);
    expect(state.suitMode).toBe(4);
    const suits = new Set(
      [...state.tableau.flat(), ...state.stock].map((c) => c.suit),
    );
    expect(suits.size).toBe(4);
  });

  it('2-suit rejects mixed-suit stack moves', () => {
    const state = dealSpider('spider-2', 12);
    state.tableau[0] = [
      { suit: 'spades', rank: 13, faceUp: true },
      { suit: 'hearts', rank: 12, faceUp: true },
    ];
    state.tableau[1] = [];
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: 0 },
      to: { zone: 'tableau' as const, index: 1 },
      fromIndex: 0,
      count: 2,
    };
    expect(canApplySpider(state, action)).toBe(false);
  });

  it('2-suit allows same-suit descending stack', () => {
    const state = dealSpider('spider-2', 13);
    state.tableau[0] = [
      { suit: 'hearts', rank: 12, faceUp: true },
      { suit: 'hearts', rank: 11, faceUp: true },
    ];
    state.tableau[1] = [{ suit: 'hearts', rank: 13, faceUp: true }];
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: 0 },
      to: { zone: 'tableau' as const, index: 1 },
      fromIndex: 0,
      count: 2,
    };
    expect(canApplySpider(state, action)).toBe(true);
  });

  it('deals a row when stock has cards and no empty columns', () => {
    const state = dealSpider('spider', 2);
    if (state.tableau.some((col) => col.length === 0)) return;
    const next = applySpider(state, { kind: 'deal-spider-row' });
    expect(next.stock.length).toBe(state.stock.length - 10);
    expect(next.moves).toBe(state.moves + 1);
  });

  it('blocks deal when a column is empty', () => {
    const state = dealSpider('spider', 3);
    state.tableau[0] = [];
    expect(canApplySpider(state, { kind: 'deal-spider-row' })).toBe(false);
  });

  it('detects win at 8 completed sequences', () => {
    const state = dealSpider('spider', 4);
    expect(isSpiderWon(state)).toBe(false);
    expect(isSpiderWon({ ...state, foundations: 8 })).toBe(true);
  });
});
