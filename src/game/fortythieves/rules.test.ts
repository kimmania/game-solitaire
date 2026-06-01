import { describe, expect, it } from 'vitest';
import {
  applyFortyThieves,
  canApplyFortyThieves,
  canPlaceOnFoundation,
  canPlaceOnTableau,
  dealFortyThieves,
  foundationSuitForIndex,
  getFortyThievesAutoFoundation,
  isFortyThievesWon,
} from './rules';

describe('forty thieves', () => {
  it('deals 40 tableau cards and 64 stock cards from a double deck', () => {
    const state = dealFortyThieves(1);
    expect(state.tableau.reduce((n, col) => n + col.length, 0)).toBe(40);
    expect(state.stock.length).toBe(64);
    expect(state.foundations.length).toBe(8);
  });

  it('maps foundation indices to suits in pairs', () => {
    expect(foundationSuitForIndex(0)).toBe('hearts');
    expect(foundationSuitForIndex(1)).toBe('hearts');
    expect(foundationSuitForIndex(2)).toBe('diamonds');
  });

  it('builds tableau down in same suit and kings on empty columns', () => {
    expect(canPlaceOnTableau({ suit: 'clubs', rank: 9, faceUp: true }, [{ suit: 'clubs', rank: 10, faceUp: true }])).toBe(true);
    expect(canPlaceOnTableau({ suit: 'hearts', rank: 9, faceUp: true }, [{ suit: 'clubs', rank: 10, faceUp: true }])).toBe(false);
    expect(canPlaceOnTableau({ suit: 'spades', rank: 13, faceUp: true }, [])).toBe(true);
    expect(canPlaceOnTableau({ suit: 'spades', rank: 12, faceUp: true }, [])).toBe(false);
  });

  it('builds foundations from ace upward in matching suit pile', () => {
    expect(canPlaceOnFoundation({ suit: 'diamonds', rank: 1, faceUp: true }, [], 2)).toBe(true);
    expect(canPlaceOnFoundation({ suit: 'diamonds', rank: 1, faceUp: true }, [], 0)).toBe(false);
    expect(
      canPlaceOnFoundation(
        { suit: 'diamonds', rank: 2, faceUp: true },
        [{ suit: 'diamonds', rank: 1, faceUp: true }],
        2,
      ),
    ).toBe(true);
    expect(
      canPlaceOnFoundation(
        { suit: 'hearts', rank: 2, faceUp: true },
        [{ suit: 'diamonds', rank: 1, faceUp: true }],
        2,
      ),
    ).toBe(false);
  });

  it('auto-foundation picks the leftmost valid pile when two accept the card', () => {
    const state = dealFortyThieves(10);
    state.tableau[0] = [{ suit: 'hearts', rank: 1, faceUp: true }];
    const from = { zone: 'tableau' as const, index: 0 };
    const target = getFortyThievesAutoFoundation(state, from, 0);
    expect(target).toEqual({ zone: 'foundation', index: 0 });
  });

  it('moves only the top tableau card', () => {
    const state = dealFortyThieves(2);
    state.tableau[0] = [
      { suit: 'hearts', rank: 10, faceUp: true },
      { suit: 'hearts', rank: 9, faceUp: true },
    ];
    state.tableau[1] = [{ suit: 'hearts', rank: 10, faceUp: true }];
    expect(
      canApplyFortyThieves(state, {
        kind: 'move-cards',
        from: { zone: 'tableau', index: 0 },
        to: { zone: 'tableau', index: 1 },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(false);
    expect(
      canApplyFortyThieves(state, {
        kind: 'move-cards',
        from: { zone: 'tableau', index: 0 },
        to: { zone: 'tableau', index: 1 },
        fromIndex: 1,
        count: 1,
      }),
    ).toBe(true);
  });

  it('wins when every foundation has thirteen cards', () => {
    const state = dealFortyThieves(3);
    state.foundations = state.foundations.map(() =>
      Array.from({ length: 13 }, (_, i) => ({
        suit: 'clubs' as const,
        rank: (i + 1) as import('../cards').Rank,
        faceUp: true,
      })),
    );
    expect(isFortyThievesWon(state)).toBe(true);
  });

  it('recycles waste when stock is empty', () => {
    const state = dealFortyThieves(4);
    state.stock = [];
    state.waste = [{ suit: 'spades', rank: 5, faceUp: true }];
    const next = applyFortyThieves(state, { kind: 'recycle-waste' });
    expect(next.stock.length).toBe(1);
    expect(next.waste.length).toBe(0);
  });
});
