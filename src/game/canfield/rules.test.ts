import { describe, expect, it } from 'vitest';
import {
  canApplyCanfield,
  canPlaceOnFoundation,
  dealCanfield,
  isCanfieldWon,
} from './rules';

describe('canfield', () => {
  it('deals reserve, tableau, starter foundation, and stock', () => {
    const state = dealCanfield(1);
    expect(state.reserve.length).toBe(13);
    expect(state.tableau.every((col) => col.length === 1)).toBe(true);
    expect(Object.values(state.foundations).flat().length).toBe(1);
    expect(state.stock.length).toBe(34);
    const starter = Object.values(state.foundations).flat();
    expect(starter.length).toBe(1);
    expect(state.baseRank).toBe(starter[0]!.rank);
  });

  it('builds foundations cyclically from base rank', () => {
    const state = dealCanfield(2);
    state.baseRank = 7;
    state.foundations.hearts = [{ suit: 'hearts', rank: 7, faceUp: true }];
    expect(
      canPlaceOnFoundation(
        { suit: 'hearts', rank: 8, faceUp: true },
        state.foundations.hearts,
        7,
      ),
    ).toBe(true);
    expect(
      canPlaceOnFoundation(
        { suit: 'hearts', rank: 6, faceUp: true },
        state.foundations.hearts,
        7,
      ),
    ).toBe(false);
  });

  it('allows only the top reserve card to move', () => {
    const state = dealCanfield(3);
    state.tableau[0] = [];
    expect(
      canApplyCanfield(state, {
        kind: 'move-cards',
        from: { zone: 'reserve' },
        to: { zone: 'tableau', index: 0 },
        fromIndex: state.reserve.length - 1,
        count: 1,
      }),
    ).toBe(true);
    expect(
      canApplyCanfield(state, {
        kind: 'move-cards',
        from: { zone: 'reserve' },
        to: { zone: 'tableau', index: 0 },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(false);
  });

  it('wins when all foundations have thirteen cards', () => {
    const state = dealCanfield(4);
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
    expect(isCanfieldWon(state)).toBe(true);
  });
});
