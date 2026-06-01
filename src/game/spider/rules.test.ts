import { describe, expect, it } from 'vitest';
import { applySpider, canApplySpider, dealSpider, isSpiderWon } from './rules';

describe('spider', () => {
  it('deals 54 to tableau and 50 to stock', () => {
    const state = dealSpider(1);
    const inTableau = state.tableau.reduce((n, col) => n + col.length, 0);
    expect(inTableau).toBe(54);
    expect(state.stock.length).toBe(50);
    expect(state.tableau.every((col) => col.every((c) => c.suit === 'spades'))).toBe(true);
  });

  it('deals a row when stock has cards and no empty columns', () => {
    const state = dealSpider(2);
    if (state.tableau.some((col) => col.length === 0)) return;
    const next = applySpider(state, { kind: 'deal-spider-row' });
    expect(next.stock.length).toBe(state.stock.length - 10);
    expect(next.moves).toBe(state.moves + 1);
  });

  it('blocks deal when a column is empty', () => {
    const state = dealSpider(3);
    state.tableau[0] = [];
    expect(canApplySpider(state, { kind: 'deal-spider-row' })).toBe(false);
  });

  it('detects win at 8 completed sequences', () => {
    const state = dealSpider(4);
    expect(isSpiderWon(state)).toBe(false);
    expect(isSpiderWon({ ...state, foundations: 8 })).toBe(true);
  });
});
