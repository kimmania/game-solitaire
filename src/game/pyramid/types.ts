import type { Card } from '../cards';

export const PYRAMID_ROWS = 7;

export interface PyramidState {
  variantId: 'pyramid';
  /** Row 0 is the peak (one card); row 6 is the base (seven cards). */
  pyramid: (Card | null)[][];
  stock: Card[];
  waste: Card[];
  hasRecycled: boolean;
  moves: number;
}
