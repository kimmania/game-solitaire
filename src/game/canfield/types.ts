import type { Card, Rank, Suit } from '../cards';

export const CANFIELD_COLUMNS = 4;
export const CANFIELD_RESERVE_SIZE = 13;

export interface CanfieldState {
  variantId: 'canfield';
  /** Rank that starts each foundation (from the opening card). */
  baseRank: Rank;
  tableau: Card[][];
  foundations: Record<Suit, Card[]>;
  reserve: Card[];
  stock: Card[];
  waste: Card[];
  moves: number;
}
