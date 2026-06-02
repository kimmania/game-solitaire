import { describe, expect, it } from 'vitest';
import {
  canApplyBeleagueredCastle,
  dealBeleagueredCastle,
  isBeleagueredCastleWon,
} from './rules';

describe('beleaguered castle', () => {
  it('starts with aces on foundations and forty-eight tableau cards', () => {
    const state = dealBeleagueredCastle(1);
    expect(Object.values(state.foundations).flat().length).toBe(4);
    expect(state.tableau.reduce((n, col) => n + col.length, 0)).toBe(48);
    expect(state.reserves.filter((c) => c !== null).length).toBeLessThanOrEqual(4);
  });

  it('moves a single card from reserve to an empty column', () => {
    const state = dealBeleagueredCastle(2);
    state.tableau[0] = [];
    state.reserves[0] = { suit: 'spades', rank: 13, faceUp: true };
    expect(
      canApplyBeleagueredCastle(state, {
        kind: 'move-cards',
        from: { zone: 'reserve', index: 0 },
        to: { zone: 'tableau', index: 0 },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(true);
  });

  it('builds foundations from ace upward', () => {
    const state = dealBeleagueredCastle(3);
    state.foundations.hearts = [{ suit: 'hearts', rank: 1, faceUp: true }];
    state.tableau[0] = [{ suit: 'hearts', rank: 2, faceUp: true }];
    expect(
      canApplyBeleagueredCastle(state, {
        kind: 'move-cards',
        from: { zone: 'tableau', index: 0 },
        to: { zone: 'foundation', suit: 'hearts' },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(true);
  });

  it('wins when all foundations hold thirteen cards', () => {
    const state = dealBeleagueredCastle(4);
    state.foundations = {
      hearts: Array.from({ length: 13 }, (_, i) => ({
        suit: 'hearts' as const,
        rank: (i + 1) as import('../cards').Rank,
        faceUp: true,
      })),
      diamonds: Array.from({ length: 13 }, (_, i) => ({
        suit: 'diamonds' as const,
        rank: (i + 1) as import('../cards').Rank,
        faceUp: true,
      })),
      clubs: Array.from({ length: 13 }, (_, i) => ({
        suit: 'clubs' as const,
        rank: (i + 1) as import('../cards').Rank,
        faceUp: true,
      })),
      spades: Array.from({ length: 13 }, (_, i) => ({
        suit: 'spades' as const,
        rank: (i + 1) as import('../cards').Rank,
        faceUp: true,
      })),
    };
    expect(isBeleagueredCastleWon(state)).toBe(true);
  });
});
