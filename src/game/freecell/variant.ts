import type { SolitaireVariant } from '../variant';
import {
  applyFreeCell,
  canApplyFreeCell,
  dealFreeCell,
  getFreeCellAutoFoundation,
  getFreeCellTargets,
  isFreeCellWon,
} from './rules';
import type { FreeCellState } from './types';

export const freecellVariant: SolitaireVariant<FreeCellState> = {
  meta: {
    id: 'freecell',
    name: 'FreeCell',
    description: 'Use four free cells to build foundations Ace to King.',
  },
  createInitialState: (seed) => dealFreeCell(seed),
  isWon: isFreeCellWon,
  canApply: canApplyFreeCell,
  apply: applyFreeCell,
  getTargetsForSelection: getFreeCellTargets,
  getAutoFoundationTarget: getFreeCellAutoFoundation,
};
