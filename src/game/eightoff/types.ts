import type { Card, Suit } from '../cards';

export const EIGHT_OFF_SLOTS = 8;
export const EIGHT_OFF_COLUMNS = 8;

export interface EightOffState {
  variantId: 'eightoff';
  tableau: Card[][];
  freeCells: (Card | null)[];
  foundations: Record<Suit, Card[]>;
  moves: number;
}
