import type { SolitaireVariant } from '../variant';
import {
  applyEasthaven,
  canApplyEasthaven,
  dealEasthaven,
  getEasthavenAutoFoundation,
  getEasthavenTargets,
  isEasthavenWon,
} from './rules';
import type { EasthavenState } from './types';

export const easthavenVariant: SolitaireVariant<EasthavenState> = {
  meta: {
    id: 'easthaven',
    name: 'Easthaven',
    description: 'Seven columns, build down in suit — one card at a time from the stock.',
  },
  createInitialState: (seed) => dealEasthaven(seed),
  isWon: isEasthavenWon,
  canApply: canApplyEasthaven,
  apply: applyEasthaven,
  getTargetsForSelection: getEasthavenTargets,
  getAutoFoundationTarget: getEasthavenAutoFoundation,
};
