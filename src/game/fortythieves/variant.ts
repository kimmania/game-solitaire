import type { SolitaireVariant } from '../variant';
import {
  applyFortyThieves,
  canApplyFortyThieves,
  dealFortyThieves,
  getFortyThievesAutoFoundation,
  getFortyThievesTargets,
  isFortyThievesWon,
} from './rules';
import type { FortyThievesState } from './types';

export const fortyThievesVariant: SolitaireVariant<FortyThievesState> = {
  meta: {
    id: 'fortythieves',
    name: 'Forty Thieves',
    description:
      'Two decks — build tableau down in suit; fill eight foundations Ace to King.',
  },
  createInitialState: (seed) => dealFortyThieves(seed),
  isWon: isFortyThievesWon,
  canApply: canApplyFortyThieves,
  apply: applyFortyThieves,
  getTargetsForSelection: getFortyThievesTargets,
  getAutoFoundationTarget: getFortyThievesAutoFoundation,
};
