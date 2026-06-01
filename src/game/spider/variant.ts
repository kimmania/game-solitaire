import type { SolitaireVariant } from '../variant';
import {
  applySpider,
  canApplySpider,
  dealSpider,
  getSpiderTargets,
  isSpiderWon,
  normalizeSpiderState,
} from './rules';
import type { SpiderState, SpiderVariantId } from './types';

function createSpiderVariant(
  id: SpiderVariantId,
  name: string,
  description: string,
): SolitaireVariant<SpiderState> {
  return {
    meta: { id, name, description },
    createInitialState: (seed) => dealSpider(id, seed),
    isWon: isSpiderWon,
    canApply: (state, action) => {
      const s = normalizeSpiderState(state);
      return s.variantId === id && canApplySpider(s, action);
    },
    apply: (state, action) => {
      const s = normalizeSpiderState(state);
      if (s.variantId !== id) return state;
      return applySpider(s, action);
    },
    getTargetsForSelection: (state, from, fromIndex, count) =>
      getSpiderTargets(normalizeSpiderState(state), from, fromIndex, count),
    getAutoFoundationTarget: () => null,
  };
}

export const spiderVariant = createSpiderVariant(
  'spider',
  'Spider (1 suit)',
  'Easiest — build descending stacks; suit does not matter.',
);

export const spider2Variant = createSpiderVariant(
  'spider-2',
  'Spider (2 suits)',
  'Medium — build down in one suit using spades and hearts only.',
);

export const spider4Variant = createSpiderVariant(
  'spider-4',
  'Spider (4 suits)',
  'Hardest — build down in matching suit with all four suits.',
);
