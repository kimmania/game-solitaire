import type { SolitaireVariant } from '../variant';
import {
  applyBeleagueredCastle,
  canApplyBeleagueredCastle,
  dealBeleagueredCastle,
  getBeleagueredCastleAutoFoundation,
  getBeleagueredCastleTargets,
  isBeleagueredCastleWon,
} from './rules';
import type { BeleagueredCastleState } from './types';

export const beleagueredCastleVariant: SolitaireVariant<BeleagueredCastleState> = {
  meta: {
    id: 'beleagueredcastle',
    name: 'Beleaguered Castle',
    description:
      'Aces start on foundations, kings in reserve — build tableau down in suit into eight columns.',
  },
  createInitialState: (seed) => dealBeleagueredCastle(seed),
  isWon: isBeleagueredCastleWon,
  canApply: canApplyBeleagueredCastle,
  apply: applyBeleagueredCastle,
  getTargetsForSelection: getBeleagueredCastleTargets,
  getAutoFoundationTarget: getBeleagueredCastleAutoFoundation,
};
