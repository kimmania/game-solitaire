import type { Card } from '../cards';

/** Card counts per row from apex to base (28 tableau cards total). */
export const TRIPEAKS_ROW_SIZES = [3, 6, 9, 10] as const;

export interface TriPeaksState {
  variantId: 'tripeaks';
  /** Row 0 is the three peaks; row 3 is the ten-card base. */
  rows: (Card | null)[][];
  stock: Card[];
  waste: Card[];
  moves: number;
}
