import type { Card, Suit } from '../cards';

export const FREECELL_SLOTS = 4;
export const FREECELL_COLUMNS = 8;

export interface FreeCellState {
  variantId: 'freecell';
  tableau: Card[][];
  freeCells: (Card | null)[];
  foundations: Record<Suit, Card[]>;
  moves: number;
}
