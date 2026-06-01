import type { Card } from '../cards';

export const FORTY_THIEVES_COLUMNS = 10;
export const FORTY_THIEVES_FOUNDATIONS = 8;

export interface FortyThievesState {
  variantId: 'fortythieves';
  tableau: Card[][];
  /** Eight foundation piles (two per suit, Ace through King each). */
  foundations: Card[][];
  stock: Card[];
  waste: Card[];
  moves: number;
}
