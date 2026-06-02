import type { SolitaireVariant } from '../variant';
import {
  applyMonteCarlo,
  canApplyMonteCarlo,
  dealMonteCarlo,
  isMonteCarloWon,
} from './rules';
import type { MonteCarloState } from './types';

export const monteCarloVariant: SolitaireVariant<MonteCarloState> = {
  meta: {
    id: 'montecarlo',
    name: 'Monte Carlo',
    description: 'Remove pairs of matching rank that touch — redeal when stuck.',
  },
  createInitialState: (seed) => dealMonteCarlo(seed),
  isWon: isMonteCarloWon,
  canApply: canApplyMonteCarlo,
  apply: applyMonteCarlo,
  getTargetsForSelection: () => [],
  getAutoFoundationTarget: () => null,
};
