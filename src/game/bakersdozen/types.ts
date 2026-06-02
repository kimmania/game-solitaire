import type { Card } from '../cards';

export const BAKERS_COLUMNS = 13;
export const BAKERS_SEQUENCE_LENGTH = 13;

export interface BakersDozenState {
  variantId: 'bakersdozen';
  tableau: Card[][];
  moves: number;
}
