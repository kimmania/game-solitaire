import type { Card } from '../cards';

export const MONTE_CARLO_ROWS = 5;
export const MONTE_CARLO_COLS = 5;
export const MONTE_CARLO_GRID_SIZE = MONTE_CARLO_ROWS * MONTE_CARLO_COLS;

export interface MonteCarloState {
  variantId: 'montecarlo';
  grid: (Card | null)[][];
  stock: Card[];
  moves: number;
}
