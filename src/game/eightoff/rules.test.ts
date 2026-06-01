import { describe, expect, it } from 'vitest';
import {
  dealEightOff,
  isEightOffWon,
  maxMovableStack,
  canApplyEightOff,
} from './rules';
import { EIGHT_OFF_COLUMNS, EIGHT_OFF_SLOTS } from './types';

describe('eight off', () => {
  it('deals 48 tableau cards and 4 pre-filled cells', () => {
    const state = dealEightOff(1);
    expect(state.tableau.reduce((n, col) => n + col.length, 0)).toBe(48);
    expect(state.freeCells.filter((c) => c !== null).length).toBe(4);
    expect(state.tableau.length).toBe(EIGHT_OFF_COLUMNS);
    expect(state.freeCells.length).toBe(EIGHT_OFF_SLOTS);
  });

  it('allows same-suit tableau build', () => {
    const state = dealEightOff(2);
    state.tableau[0] = [{ suit: 'hearts', rank: 10, faceUp: true }];
    state.tableau[1] = [{ suit: 'hearts', rank: 11, faceUp: true }];
    expect(
      canApplyEightOff(state, {
        kind: 'move-cards',
        from: { zone: 'tableau', index: 0 },
        to: { zone: 'tableau', index: 1 },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(true);
  });

  it('computes max movable stack with eight cells', () => {
    const state = dealEightOff(3);
    expect(maxMovableStack(state)).toBeGreaterThan(1);
  });

  it('wins when foundations are full', () => {
    const state = dealEightOff(4);
    state.foundations = {
      hearts: Array.from({ length: 13 }, (_, i) => ({
        suit: 'hearts' as const,
        rank: (i + 1) as 1,
        faceUp: true,
      })),
      diamonds: Array.from({ length: 13 }, (_, i) => ({
        suit: 'diamonds' as const,
        rank: (i + 1) as 1,
        faceUp: true,
      })),
      clubs: Array.from({ length: 13 }, (_, i) => ({
        suit: 'clubs' as const,
        rank: (i + 1) as 1,
        faceUp: true,
      })),
      spades: Array.from({ length: 13 }, (_, i) => ({
        suit: 'spades' as const,
        rank: (i + 1) as 1,
        faceUp: true,
      })),
    };
    expect(isEightOffWon(state)).toBe(true);
  });
});
