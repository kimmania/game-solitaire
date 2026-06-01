import type { SolitaireVariant } from '../variant';
import {
  applyScorpion,
  canApplyScorpion,
  dealScorpion,
  getScorpionAutoFoundation,
  getScorpionTargets,
  isScorpionWon,
} from './rules';
import type { ScorpionState } from './types';

export const scorpionVariant: SolitaireVariant<ScorpionState> = {
  meta: {
    id: 'scorpion',
    name: 'Scorpion',
    description:
      'Build down in suit on seven columns — clear four King-to-Ace runs; deal stock to the first four columns.',
  },
  createInitialState: (seed) => dealScorpion(seed),
  isWon: isScorpionWon,
  canApply: canApplyScorpion,
  apply: applyScorpion,
  getTargetsForSelection: getScorpionTargets,
  getAutoFoundationTarget: getScorpionAutoFoundation,
};
