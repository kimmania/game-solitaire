import { easthavenVariant } from './easthaven/variant';
import type { EasthavenState } from './easthaven/types';
import { freecellVariant } from './freecell/variant';
import type { FreeCellState } from './freecell/types';
import { klondikeVariant } from './klondike/variant';
import type { KlondikeState } from './klondike/types';
import { spider2Variant, spider4Variant, spiderVariant } from './spider/variant';
import type { SpiderState } from './spider/types';
import { yukonVariant } from './yukon/variant';
import type { YukonState } from './yukon/types';
import type { SolitaireVariant } from './variant';

export const VARIANTS = [
  klondikeVariant,
  freecellVariant,
  spiderVariant,
  spider2Variant,
  spider4Variant,
  yukonVariant,
  easthavenVariant,
] as const;

export type VariantId = (typeof VARIANTS)[number]['meta']['id'];

export type AnyGameState =
  | KlondikeState
  | FreeCellState
  | SpiderState
  | YukonState
  | EasthavenState;

const byId: Record<VariantId, SolitaireVariant<AnyGameState>> = {
  klondike: klondikeVariant as SolitaireVariant<AnyGameState>,
  freecell: freecellVariant as SolitaireVariant<AnyGameState>,
  spider: spiderVariant as SolitaireVariant<AnyGameState>,
  'spider-2': spider2Variant as SolitaireVariant<AnyGameState>,
  'spider-4': spider4Variant as SolitaireVariant<AnyGameState>,
  yukon: yukonVariant as SolitaireVariant<AnyGameState>,
  easthaven: easthavenVariant as SolitaireVariant<AnyGameState>,
};

export function getVariant(id: VariantId): SolitaireVariant<AnyGameState> {
  return byId[id];
}

export const DEFAULT_VARIANT_ID: VariantId = 'klondike';
