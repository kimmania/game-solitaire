import type { SolitaireVariant } from '../variant';
import {
  applyEightOff,
  canApplyEightOff,
  dealEightOff,
  getEightOffAutoFoundation,
  getEightOffTargets,
  isEightOffWon,
} from './rules';
import type { EightOffState } from './types';

export const eightOffVariant: SolitaireVariant<EightOffState> = {
  meta: {
    id: 'eightoff',
    name: 'Eight Off',
    description: 'Eight cells and columns — build tableau down in suit, foundations up.',
  },
  createInitialState: (seed) => dealEightOff(seed),
  isWon: isEightOffWon,
  canApply: canApplyEightOff,
  apply: applyEightOff,
  getTargetsForSelection: getEightOffTargets,
  getAutoFoundationTarget: getEightOffAutoFoundation,
};
