import type { Card } from '../cards';

export const SPIDER_COLUMNS = 10;
export const SPIDER_FOUNDATIONS = 8;
export const SEQUENCE_LENGTH = 13;

export const SPIDER_VARIANT_IDS = ['spider', 'spider-2', 'spider-4'] as const;
export type SpiderVariantId = (typeof SPIDER_VARIANT_IDS)[number];

export type SpiderSuitMode = 1 | 2 | 4;

export interface SpiderState {
  variantId: SpiderVariantId;
  suitMode: SpiderSuitMode;
  tableau: Card[][];
  stock: Card[];
  /** Completed King-through-Ace sequences removed from play */
  foundations: number;
  moves: number;
}

export function spiderSuitMode(variantId: SpiderVariantId): SpiderSuitMode {
  switch (variantId) {
    case 'spider':
      return 1;
    case 'spider-2':
      return 2;
    case 'spider-4':
      return 4;
  }
}

export function isSpiderVariantId(id: string): id is SpiderVariantId {
  return (SPIDER_VARIANT_IDS as readonly string[]).includes(id);
}
