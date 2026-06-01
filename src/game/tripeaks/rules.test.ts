import { describe, expect, it } from 'vitest';
import {
  applyTriPeaks,
  canApplyTriPeaks,
  canPlayTriPeaksPick,
  dealTriPeaks,
  getTriPeaksCoverCols,
  getTriPeaksPlayTargets,
  isTriPeaksExposed,
  isTriPeaksWon,
  ranksAreAdjacent,
  triPeaksCardsRemaining,
} from './rules';

describe('tripeaks', () => {
  it('deals 28 tableau cards and 24 stock cards', () => {
    const state = dealTriPeaks(1);
    expect(triPeaksCardsRemaining(state)).toBe(28);
    expect(state.stock.length).toBe(24);
    expect(state.rows[0].length).toBe(3);
    expect(state.rows[3].length).toBe(10);
  });

  it('treats ace and king as adjacent', () => {
    expect(ranksAreAdjacent(1, 13)).toBe(true);
    expect(ranksAreAdjacent(13, 1)).toBe(true);
    expect(ranksAreAdjacent(7, 8)).toBe(true);
    expect(ranksAreAdjacent(7, 9)).toBe(false);
  });

  it('row 2 leftmost has a single cover on the base row', () => {
    expect(getTriPeaksCoverCols(2, 0)).toEqual([0]);
    const state = dealTriPeaks(20);
    expect(isTriPeaksExposed(state, 2, 0)).toBe(false);
    state.rows[3][0] = null;
    expect(isTriPeaksExposed(state, 2, 0)).toBe(true);
    state.rows[3][1] = { suit: 'spades', rank: 5, faceUp: true };
    expect(isTriPeaksExposed(state, 2, 0)).toBe(true);
  });

  it('row 2 second card needs both covers below cleared', () => {
    expect(getTriPeaksCoverCols(2, 1)).toEqual([1, 2]);
    const state = dealTriPeaks(21);
    state.rows[3][1] = null;
    expect(isTriPeaksExposed(state, 2, 1)).toBe(false);
    state.rows[3][2] = null;
    expect(isTriPeaksExposed(state, 2, 1)).toBe(true);
  });

  it('row 1 leftmost is covered by cols 1 and 2 on the row below', () => {
    expect(getTriPeaksCoverCols(1, 0)).toEqual([1, 2]);
    const state = dealTriPeaks(22);
    state.rows[2][0] = null;
    expect(isTriPeaksExposed(state, 1, 0)).toBe(false);
    state.rows[2][1] = null;
    state.rows[2][2] = null;
    expect(isTriPeaksExposed(state, 1, 0)).toBe(true);
  });

  it('exposes bottom row and cards with cleared covers', () => {
    const state = dealTriPeaks(2);
    expect(isTriPeaksExposed(state, 3, 0)).toBe(true);
    expect(isTriPeaksExposed(state, 0, 0)).toBe(false);
    state.rows[1][0] = null;
    state.rows[1][1] = null;
    expect(isTriPeaksExposed(state, 0, 0)).toBe(true);

    const peak = dealTriPeaks(20);
    expect(isTriPeaksExposed(peak, 0, 1)).toBe(false);
    peak.rows[1][1] = null;
    peak.rows[1][2] = null;
    expect(isTriPeaksExposed(peak, 0, 1)).toBe(false);
    peak.rows[1][3] = null;
    expect(isTriPeaksExposed(peak, 0, 1)).toBe(true);
  });

  it('plays an exposed card onto the waste when ranks match', () => {
    const state = dealTriPeaks(3);
    state.waste = [{ suit: 'hearts', rank: 7, faceUp: true }];
    state.rows[3][0] = { suit: 'clubs', rank: 8, faceUp: true };
    const pick = { zone: 'tripeaks' as const, row: 3, col: 0 };
    expect(canPlayTriPeaksPick(state, pick)).toBe(true);
    const next = applyTriPeaks(state, { kind: 'play-tripeaks-card', pick });
    expect(next.rows[3][0]).toBeNull();
    expect(next.waste[next.waste.length - 1]?.rank).toBe(8);
    expect(triPeaksCardsRemaining(next)).toBe(27);
  });

  it('lists valid play targets from waste', () => {
    const state = dealTriPeaks(4);
    state.waste = [{ suit: 'spades', rank: 5, faceUp: true }];
    state.rows[3][0] = { suit: 'hearts', rank: 4, faceUp: true };
    state.rows[3][1] = { suit: 'diamonds', rank: 9, faceUp: true };
    const targets = getTriPeaksPlayTargets(state);
    expect(targets).toContainEqual({ zone: 'tripeaks', row: 3, col: 0 });
    expect(targets).not.toContainEqual({ zone: 'tripeaks', row: 3, col: 1 });
  });

  it('wins when tableau, stock, and waste are empty', () => {
    const state = dealTriPeaks(5);
    state.rows = state.rows.map((row) => row.map(() => null));
    state.stock = [];
    state.waste = [];
    expect(isTriPeaksWon(state)).toBe(true);
  });

  it('recycles waste when stock is empty', () => {
    const state = dealTriPeaks(6);
    state.stock = [];
    state.waste = [{ suit: 'clubs', rank: 2, faceUp: true }];
    expect(canApplyTriPeaks(state, { kind: 'recycle-waste' })).toBe(true);
    const next = applyTriPeaks(state, { kind: 'recycle-waste' });
    expect(next.stock.length).toBe(1);
    expect(next.waste.length).toBe(0);
  });
});
