import type { SolitaireVariant } from '../variant';
import {
  applyTriPeaks,
  canApplyTriPeaks,
  dealTriPeaks,
  isTriPeaksWon,
} from './rules';
import type { TriPeaksState } from './types';

export const tripeaksVariant: SolitaireVariant<TriPeaksState> = {
  meta: {
    id: 'tripeaks',
    name: 'TriPeaks',
    description: 'Clear three peaks — play exposed cards one rank above or below the waste.',
  },
  createInitialState: (seed) => dealTriPeaks(seed),
  isWon: isTriPeaksWon,
  canApply: canApplyTriPeaks,
  apply: applyTriPeaks,
  getTargetsForSelection: () => [],
  getAutoFoundationTarget: () => null,
};
