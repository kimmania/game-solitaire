import type { SolitaireVariant } from '../variant';
import {
  applyBakersDozen,
  canApplyBakersDozen,
  dealBakersDozen,
  getBakersDozenAutoFoundation,
  getBakersDozenTargets,
  isBakersDozenWon,
} from './rules';
import type { BakersDozenState } from './types';

export const bakersDozenVariant: SolitaireVariant<BakersDozenState> = {
  meta: {
    id: 'bakersdozen',
    name: "Baker's Dozen",
    description:
      'Thirteen columns — kings start at the bottom; build down in suit one card at a time.',
  },
  createInitialState: (seed) => dealBakersDozen(seed),
  isWon: isBakersDozenWon,
  canApply: canApplyBakersDozen,
  apply: applyBakersDozen,
  getTargetsForSelection: getBakersDozenTargets,
  getAutoFoundationTarget: getBakersDozenAutoFoundation,
};
