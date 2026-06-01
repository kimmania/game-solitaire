import { freecellVariant } from './freecell/variant';
import type { FreeCellState } from './freecell/types';
import { klondikeVariant } from './klondike/variant';
import type { KlondikeState } from './klondike/types';
import { spiderVariant } from './spider/variant';
import type { SpiderState } from './spider/types';
import type { SolitaireVariant } from './variant';

export const VARIANTS = [klondikeVariant, freecellVariant, spiderVariant] as const;

export type VariantId = (typeof VARIANTS)[number]['meta']['id'];

export type AnyGameState = KlondikeState | FreeCellState | SpiderState;

const byId: Record<VariantId, SolitaireVariant<AnyGameState>> = {
  klondike: klondikeVariant as SolitaireVariant<AnyGameState>,
  freecell: freecellVariant as SolitaireVariant<AnyGameState>,
  spider: spiderVariant as SolitaireVariant<AnyGameState>,
};

export function getVariant(id: VariantId): SolitaireVariant<AnyGameState> {
  return byId[id];
}

export const DEFAULT_VARIANT_ID: VariantId = 'klondike';
