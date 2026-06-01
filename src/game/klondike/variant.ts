import type { SolitaireVariant } from '../variant';
import {
  applyKlondike,
  canApplyKlondike,
  dealKlondike,
  getKlondikeAutoFoundation,
  getKlondikeTargets,
  isKlondikeWon,
} from './rules';
import type { KlondikeState } from './types';

export const klondikeVariant: SolitaireVariant<KlondikeState> = {
  meta: {
    id: 'klondike',
    name: 'Klondike',
    description: 'Classic solitaire — build foundations Ace to King.',
  },
  createInitialState: (seed) => dealKlondike(seed),
  isWon: isKlondikeWon,
  canApply: canApplyKlondike,
  apply: applyKlondike,
  getTargetsForSelection: getKlondikeTargets,
  getAutoFoundationTarget: getKlondikeAutoFoundation,
};
