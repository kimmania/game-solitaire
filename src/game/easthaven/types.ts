import type { Card, Suit } from '../cards';

export const EASTHAVEN_COLUMNS = 7;

export interface EasthavenState {
  variantId: 'easthaven';
  tableau: Card[][];
  foundations: Record<Suit, Card[]>;
  stock: Card[];
  waste: Card[];
  /** Stock has been recycled once (one redeal allowed). */
  hasRecycled: boolean;
  moves: number;
}
