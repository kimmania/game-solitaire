import type { Card } from '../cards';

export const SPIDER_COLUMNS = 10;
export const SPIDER_FOUNDATIONS = 8;
export const SEQUENCE_LENGTH = 13;

export interface SpiderState {
  variantId: 'spider';
  tableau: Card[][];
  stock: Card[];
  /** Completed King-through-Ace sequences removed from play */
  foundations: number;
  moves: number;
}
