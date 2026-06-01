import type { Card, Suit } from '../cards';

export const YUKON_COLUMNS = 7;

export interface YukonState {
  variantId: 'yukon';
  tableau: Card[][];
  foundations: Record<Suit, Card[]>;
  moves: number;
}
