import { describe, expect, it } from 'vitest';
import type { MonteCarloPick } from '../variant';
import {
  applyMonteCarlo,
  canApplyMonteCarlo,
  dealMonteCarlo,
  gridCardsRemaining,
  hasAnyPair,
  isMonteCarloWon,
  picksAreValidPair,
} from './rules';
import { MONTE_CARLO_GRID_SIZE } from './types';

describe('monte carlo', () => {
  it('deals 25 grid cards and 27 stock cards', () => {
    const state = dealMonteCarlo(1);
    expect(gridCardsRemaining(state)).toBe(MONTE_CARLO_GRID_SIZE);
    expect(state.stock.length).toBe(27);
  });

  it('removes adjacent matching ranks', () => {
    const state = dealMonteCarlo(2);
    state.grid[0][0] = { suit: 'hearts', rank: 8, faceUp: true };
    state.grid[0][1] = { suit: 'clubs', rank: 8, faceUp: true };
    const picks: [MonteCarloPick, MonteCarloPick] = [
      { zone: 'grid', row: 0, col: 0 },
      { zone: 'grid', row: 0, col: 1 },
    ];
    expect(picksAreValidPair(state, picks)).toBe(true);
    const next = applyMonteCarlo(state, { kind: 'remove-monte-carlo-pair', picks });
    expect(gridCardsRemaining(next)).toBe(23);
  });

  it('rejects non-adjacent pairs', () => {
    const state = dealMonteCarlo(3);
    state.grid[0][0] = { suit: 'hearts', rank: 5, faceUp: true };
    state.grid[2][2] = { suit: 'clubs', rank: 5, faceUp: true };
    expect(
      picksAreValidPair(state, [
        { zone: 'grid', row: 0, col: 0 },
        { zone: 'grid', row: 2, col: 2 },
      ]),
    ).toBe(false);
  });

  it('redeals when no pairs remain and stock has cards', () => {
    const state = dealMonteCarlo(4);
    state.grid = state.grid.map((row) => row.map(() => null));
    state.grid[0][0] = { suit: 'hearts', rank: 1, faceUp: true };
    state.grid[0][2] = { suit: 'clubs', rank: 2, faceUp: true };
    expect(hasAnyPair(state)).toBe(false);
    expect(canApplyMonteCarlo(state, { kind: 'redeal-monte-carlo' })).toBe(true);
  });

  it('wins with empty grid and stock', () => {
    const state = dealMonteCarlo(5);
    state.grid = state.grid.map((row) => row.map(() => null));
    state.stock = [];
    expect(isMonteCarloWon(state)).toBe(true);
  });
});
