import { describe, expect, it } from 'vitest';
import type { Rank, Suit } from '../cards';
import {
  canApplyBakersDozen,
  dealBakersDozen,
  isBakersDozenWon,
  promoteKingsToBottom,
} from './rules';

describe("baker's dozen", () => {
  it('deals four face-up cards to each of thirteen columns', () => {
    const state = dealBakersDozen(1);
    expect(state.tableau.every((col) => col.length === 4)).toBe(true);
    expect(state.tableau.every((col) => col.every((c) => c.faceUp))).toBe(true);
  });

  it('places kings at the bottom of a column', () => {
    const column = [
      { suit: 'hearts' as const, rank: 9 as const, faceUp: true },
      { suit: 'clubs' as const, rank: 13 as const, faceUp: true },
      { suit: 'diamonds' as const, rank: 5 as const, faceUp: true },
    ];
    promoteKingsToBottom(column);
    expect(column[0].rank).toBe(13);
  });

  it('moves only the top card onto same-suit descending builds', () => {
    const state = dealBakersDozen(2);
    state.tableau[0] = [{ suit: 'hearts', rank: 10, faceUp: true }];
    state.tableau[1] = [{ suit: 'hearts', rank: 11, faceUp: true }];
    expect(
      canApplyBakersDozen(state, {
        kind: 'move-cards',
        from: { zone: 'tableau', index: 0 },
        to: { zone: 'tableau', index: 1 },
        fromIndex: 0,
        count: 1,
      }),
    ).toBe(true);
  });

  it('wins with four king-to-ace columns and the rest empty', () => {
    const state = dealBakersDozen(3);
    const sequence = (suit: Suit) =>
      Array.from({ length: 13 }, (_, i) => ({
        suit,
        rank: (13 - i) as Rank,
        faceUp: true,
      }));
    state.tableau = [
      sequence('hearts'),
      sequence('diamonds'),
      sequence('clubs'),
      sequence('spades'),
      ...Array.from({ length: 9 }, () => []),
    ];
    expect(isBakersDozenWon(state)).toBe(true);
  });
});
