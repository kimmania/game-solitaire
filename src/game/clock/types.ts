import type { Card } from '../cards';

/** Hour piles 0–11 (Ace–Queen) and index 12 for Kings. */
export const CLOCK_HOUR_PILES = 12;
export const CLOCK_CENTER_INDEX = 12;
export const CLOCK_PILE_COUNT = 13;
export const CLOCK_CARDS_PER_PILE = 4;

export interface ClockState {
  variantId: 'clock';
  piles: Card[][];
  /** Which pile to draw from next (starts at center). */
  activePile: number;
  kingsToCenter: number;
  lost: boolean;
  moves: number;
}
