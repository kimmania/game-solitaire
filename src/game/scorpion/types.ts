import type { Card } from '../cards';

export const SCORPION_COLUMNS = 7;
export const SCORPION_SEQUENCE_LENGTH = 13;
export const SCORPION_FOUNDATIONS = 4;
export const SCORPION_DEAL_COLUMNS = 4;

export interface ScorpionState {
  variantId: 'scorpion';
  tableau: Card[][];
  stock: Card[];
  /** Completed King-to-Ace sequences removed from play. */
  foundations: number;
  moves: number;
}
