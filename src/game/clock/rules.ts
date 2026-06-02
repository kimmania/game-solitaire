import { createDeck, shuffle, type Card, type Rank } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction } from '../variant';
import {
  CLOCK_CARDS_PER_PILE,
  CLOCK_CENTER_INDEX,
  CLOCK_PILE_COUNT,
  type ClockState,
} from './types';

export function rankToPileIndex(rank: Rank): number {
  return rank === 13 ? CLOCK_CENTER_INDEX : rank - 1;
}

export function pileLabel(rank: Rank): string {
  if (rank === 13) return 'Kings';
  if (rank === 1) return '1';
  if (rank === 11) return 'J';
  if (rank === 12) return 'Q';
  return String(rank);
}

export function dealClock(seed?: number): ClockState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const piles: Card[][] = Array.from({ length: CLOCK_PILE_COUNT }, () => []);
  let offset = 0;

  for (let p = 0; p < CLOCK_PILE_COUNT; p++) {
    for (let i = 0; i < CLOCK_CARDS_PER_PILE; i++) {
      const card = deck[offset++];
      card.faceUp = false;
      piles[p].push(card);
    }
  }

  return {
    variantId: 'clock',
    piles,
    activePile: CLOCK_CENTER_INDEX,
    kingsToCenter: 0,
    lost: false,
    moves: 0,
  };
}

export function revealedCount(state: ClockState): number {
  return state.piles.reduce((n, pile) => n + pile.filter((c) => c.faceUp).length, 0);
}

export function isClockWon(state: ClockState): boolean {
  return !state.lost && revealedCount(state) === 52;
}

export function isClockLost(state: ClockState): boolean {
  return state.lost;
}

export function canApplyClock(state: ClockState, action: GameAction): boolean {
  if (state.variantId !== 'clock') return false;
  if (state.lost) return false;
  if (action.kind !== 'flip-clock') return false;

  const pile = state.piles[state.activePile];
  return pile.some((c) => !c.faceUp);
}

export function applyClock(state: ClockState, action: GameAction): ClockState {
  if (!canApplyClock(state, action)) return state;

  const next: ClockState = {
    ...state,
    piles: state.piles.map((pile) => [...pile]),
    moves: state.moves + 1,
  };

  const source = next.piles[next.activePile];
  const faceDownIndex = source.findIndex((c) => !c.faceUp);
  if (faceDownIndex === -1) return state;

  const card = source[faceDownIndex];
  card.faceUp = true;

  const targetIndex = rankToPileIndex(card.rank);
  const target = next.piles[targetIndex];

  source.splice(faceDownIndex, 1);
  target.push(card);

  let kingsToCenter = next.kingsToCenter;
  let lost = next.lost;

  if (card.rank === 13) {
    kingsToCenter++;
    if (kingsToCenter === 4 && revealedCount({ ...next, kingsToCenter }) < 52) {
      lost = true;
    }
  }

  return {
    ...next,
    activePile: targetIndex,
    kingsToCenter,
    lost,
  };
}
