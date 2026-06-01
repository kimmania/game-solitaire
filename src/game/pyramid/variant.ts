import type { SolitaireVariant } from '../variant';
import {
  applyPyramid,
  canApplyPyramid,
  dealPyramid,
  isPyramidWon,
} from './rules';
import type { PyramidState } from './types';

export const pyramidVariant: SolitaireVariant<PyramidState> = {
  meta: {
    id: 'pyramid',
    name: 'Pyramid',
    description: 'Pair exposed cards that sum to 13 — clear the pyramid and stock.',
  },
  createInitialState: (seed) => dealPyramid(seed),
  isWon: isPyramidWon,
  canApply: canApplyPyramid,
  apply: applyPyramid,
  getTargetsForSelection: () => [],
  getAutoFoundationTarget: () => null,
};
