import { describe, expect, it } from 'vitest';
import {
  applyPyramid,
  canApplyPyramid,
  dealPyramid,
  isPyramidExposed,
  isPyramidWon,
  picksAreValidRemoval,
  pyramidCardsRemaining,
} from './rules';

describe('pyramid', () => {
  it('deals 28 pyramid cards and 24 stock cards', () => {
    const state = dealPyramid(1);
    expect(pyramidCardsRemaining(state)).toBe(28);
    expect(state.stock.length).toBe(24);
    expect(state.pyramid[0].length).toBe(1);
    expect(state.pyramid[6].length).toBe(7);
  });

  it('exposes only uncovered pyramid cards', () => {
    const state = dealPyramid(2);
    expect(isPyramidExposed(state, 6, 0)).toBe(true);
    expect(isPyramidExposed(state, 0, 0)).toBe(false);
    state.pyramid[1][0] = null;
    state.pyramid[1][1] = null;
    expect(isPyramidExposed(state, 0, 0)).toBe(true);
  });

  it('allows removing a king alone', () => {
    const state = dealPyramid(3);
    state.pyramid[6][0] = { suit: 'spades', rank: 13, faceUp: true };
    const picks = [{ zone: 'pyramid' as const, row: 6, col: 0 }];
    expect(picksAreValidRemoval(state, picks)).toBe(true);
    const next = applyPyramid(state, { kind: 'remove-pyramid-cards', picks });
    expect(next.pyramid[6][0]).toBeNull();
  });

  it('allows removing a pair that sums to 13', () => {
    const state = dealPyramid(4);
    state.pyramid[6][0] = { suit: 'hearts', rank: 1, faceUp: true };
    state.pyramid[6][1] = { suit: 'clubs', rank: 12, faceUp: true };
    const picks = [
      { zone: 'pyramid' as const, row: 6, col: 0 },
      { zone: 'pyramid' as const, row: 6, col: 1 },
    ];
    expect(picksAreValidRemoval(state, picks)).toBe(true);
    const next = applyPyramid(state, { kind: 'remove-pyramid-cards', picks });
    expect(pyramidCardsRemaining(next)).toBe(26);
  });

  it('allows pyramid and waste pair', () => {
    const state = dealPyramid(5);
    state.pyramid[6][0] = { suit: 'diamonds', rank: 6, faceUp: true };
    state.waste = [{ suit: 'spades', rank: 7, faceUp: true }];
    const picks = [
      { zone: 'pyramid' as const, row: 6, col: 0 },
      { zone: 'waste' as const },
    ];
    expect(picksAreValidRemoval(state, picks)).toBe(true);
  });

  it('detects win when pyramid stock and waste are empty', () => {
    const state = dealPyramid(6);
    expect(isPyramidWon(state)).toBe(false);
    const empty = {
      ...state,
      pyramid: state.pyramid.map(() => []),
      stock: [],
      waste: [],
    };
    expect(isPyramidWon(empty)).toBe(true);
  });

  it('allows one stock recycle', () => {
    let state = dealPyramid(7);
    while (state.stock.length > 0) {
      state = applyPyramid(state, { kind: 'flip-stock' });
    }
    expect(canApplyPyramid(state, { kind: 'recycle-waste' })).toBe(true);
    state = applyPyramid(state, { kind: 'recycle-waste' });
    expect(canApplyPyramid(state, { kind: 'recycle-waste' })).toBe(false);
  });
});
