import type { Card, Suit } from '../cards';

export const BELEAGUERED_COLUMNS = 8;
export const BELEAGUERED_RESERVES = 4;

export interface BeleagueredCastleState {
  variantId: 'beleagueredcastle';
  tableau: Card[][];
  reserves: (Card | null)[];
  foundations: Record<Suit, Card[]>;
  moves: number;
}
