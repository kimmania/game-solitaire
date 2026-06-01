import type { SolitaireVariant } from '../variant';
import {
  applyCanfield,
  canApplyCanfield,
  dealCanfield,
  getCanfieldAutoFoundation,
  getCanfieldTargets,
  isCanfieldWon,
} from './rules';
import type { CanfieldState } from './types';

export const canfieldVariant: SolitaireVariant<CanfieldState> = {
  meta: {
    id: 'canfield',
    name: 'Canfield',
    description:
      'Reserve pile, cyclic foundations from a starter rank, tableau builds down alternating color.',
  },
  createInitialState: (seed) => dealCanfield(seed),
  isWon: isCanfieldWon,
  canApply: canApplyCanfield,
  apply: applyCanfield,
  getTargetsForSelection: getCanfieldTargets,
  getAutoFoundationTarget: getCanfieldAutoFoundation,
};
