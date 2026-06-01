import type { Card, Suit } from '../cards';

export const TABLEAU_COLUMNS = 7;

export interface KlondikeState {
  variantId: 'klondike';
  tableau: Card[][];
  foundations: Record<Suit, Card[]>;
  stock: Card[];
  waste: Card[];
  moves: number;
}
