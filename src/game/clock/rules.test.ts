import { describe, expect, it } from 'vitest';
import {
  applyClock,
  canApplyClock,
  dealClock,
  isClockLost,
  isClockWon,
  rankToPileIndex,
  revealedCount,
} from './rules';
import { CLOCK_CENTER_INDEX } from './types';

describe('clock', () => {
  it('deals four face-down cards to each of thirteen piles', () => {
    const state = dealClock(1);
    expect(state.piles.every((p) => p.length === 4)).toBe(true);
    expect(state.activePile).toBe(CLOCK_CENTER_INDEX);
    expect(revealedCount(state)).toBe(0);
  });

  it('maps ranks to hour piles', () => {
    expect(rankToPileIndex(1)).toBe(0);
    expect(rankToPileIndex(12)).toBe(11);
    expect(rankToPileIndex(13)).toBe(CLOCK_CENTER_INDEX);
  });

  it('reveals a card and moves it to the matching pile', () => {
    const state = dealClock(2);
    state.piles[CLOCK_CENTER_INDEX] = [
      { suit: 'hearts', rank: 5, faceUp: false },
      { suit: 'clubs', rank: 3, faceUp: false },
      { suit: 'diamonds', rank: 9, faceUp: false },
      { suit: 'spades', rank: 1, faceUp: false },
    ];
    const next = applyClock(state, { kind: 'flip-clock' });
    expect(next.piles[4].some((c) => c.rank === 5 && c.faceUp)).toBe(true);
    expect(next.activePile).toBe(4);
    expect(revealedCount(next)).toBe(1);
  });

  it('loses on the fourth king before all cards are out', () => {
    const state = dealClock(3);
    state.kingsToCenter = 3;
    state.piles[0] = [{ suit: 'hearts', rank: 13, faceUp: false }];
    state.activePile = 0;
    const next = applyClock(state, { kind: 'flip-clock' });
    expect(next.kingsToCenter).toBe(4);
    expect(isClockLost(next)).toBe(true);
    expect(canApplyClock(next, { kind: 'flip-clock' })).toBe(false);
  });

  it('wins when all cards are face up', () => {
    const state = dealClock(4);
    state.piles = state.piles.map(() => [
      { suit: 'hearts', rank: 1, faceUp: true },
      { suit: 'hearts', rank: 2, faceUp: true },
      { suit: 'hearts', rank: 3, faceUp: true },
      { suit: 'hearts', rank: 4, faceUp: true },
    ]);
    expect(isClockWon(state)).toBe(true);
  });
});
