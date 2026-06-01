import { canfieldVariant } from './canfield/variant';
import type { CanfieldState } from './canfield/types';
import { eightOffVariant } from './eightoff/variant';
import type { EightOffState } from './eightoff/types';
import { scorpionVariant } from './scorpion/variant';
import type { ScorpionState } from './scorpion/types';
import { easthavenVariant } from './easthaven/variant';
import type { EasthavenState } from './easthaven/types';
import { freecellVariant } from './freecell/variant';
import type { FreeCellState } from './freecell/types';
import { klondikeVariant } from './klondike/variant';
import type { KlondikeState } from './klondike/types';
import { spider2Variant, spider4Variant, spiderVariant } from './spider/variant';
import type { SpiderState } from './spider/types';
import { fortyThievesVariant } from './fortythieves/variant';
import type { FortyThievesState } from './fortythieves/types';
import { pyramidVariant } from './pyramid/variant';
import type { PyramidState } from './pyramid/types';
import { tripeaksVariant } from './tripeaks/variant';
import type { TriPeaksState } from './tripeaks/types';
import { yukonVariant } from './yukon/variant';
import type { YukonState } from './yukon/types';
import type { SolitaireVariant } from './variant';

/** Display order for the game picker (alphabetical by name). */
export const VARIANTS = [
  canfieldVariant,
  easthavenVariant,
  eightOffVariant,
  fortyThievesVariant,
  freecellVariant,
  klondikeVariant,
  pyramidVariant,
  scorpionVariant,
  spiderVariant,
  spider2Variant,
  spider4Variant,
  tripeaksVariant,
  yukonVariant,
] as const;

export type VariantId = (typeof VARIANTS)[number]['meta']['id'];

export type AnyGameState =
  | KlondikeState
  | FreeCellState
  | SpiderState
  | YukonState
  | EasthavenState
  | PyramidState
  | TriPeaksState
  | FortyThievesState
  | EightOffState
  | CanfieldState
  | ScorpionState;

const byId: Record<VariantId, SolitaireVariant<AnyGameState>> = {
  klondike: klondikeVariant as SolitaireVariant<AnyGameState>,
  freecell: freecellVariant as SolitaireVariant<AnyGameState>,
  spider: spiderVariant as SolitaireVariant<AnyGameState>,
  'spider-2': spider2Variant as SolitaireVariant<AnyGameState>,
  'spider-4': spider4Variant as SolitaireVariant<AnyGameState>,
  yukon: yukonVariant as SolitaireVariant<AnyGameState>,
  easthaven: easthavenVariant as SolitaireVariant<AnyGameState>,
  pyramid: pyramidVariant as SolitaireVariant<AnyGameState>,
  tripeaks: tripeaksVariant as SolitaireVariant<AnyGameState>,
  fortythieves: fortyThievesVariant as SolitaireVariant<AnyGameState>,
  eightoff: eightOffVariant as SolitaireVariant<AnyGameState>,
  canfield: canfieldVariant as SolitaireVariant<AnyGameState>,
  scorpion: scorpionVariant as SolitaireVariant<AnyGameState>,
};

export function getVariant(id: VariantId): SolitaireVariant<AnyGameState> {
  return byId[id];
}

export const DEFAULT_VARIANT_ID: VariantId = 'klondike';
