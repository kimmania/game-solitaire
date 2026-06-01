import { klondikeVariant } from './klondike/variant';
import type { KlondikeState } from './klondike/types';
import type { SolitaireVariant } from './variant';

/** All implemented variants — extend when adding Spider, FreeCell, etc. */
export const VARIANTS = [klondikeVariant] as const;

export type VariantId = (typeof VARIANTS)[number]['meta']['id'];

export type AnyGameState = KlondikeState;

const byId: Record<VariantId, SolitaireVariant<AnyGameState>> = {
  klondike: klondikeVariant,
};

export function getVariant(id: VariantId): SolitaireVariant<AnyGameState> {
  return byId[id];
}

export const DEFAULT_VARIANT_ID: VariantId = 'klondike';
