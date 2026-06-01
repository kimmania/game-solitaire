import type { SolitaireVariant } from '../variant';
import {
  applyYukon,
  canApplyYukon,
  dealYukon,
  getYukonAutoFoundation,
  getYukonTargets,
  isYukonWon,
} from './rules';
import type { YukonState } from './types';

export const yukonVariant: SolitaireVariant<YukonState> = {
  meta: {
    id: 'yukon',
    name: 'Yukon',
    description: 'All cards face up — move any face-up stack; build alternating colors.',
  },
  createInitialState: (seed) => dealYukon(seed),
  isWon: isYukonWon,
  canApply: canApplyYukon,
  apply: applyYukon,
  getTargetsForSelection: getYukonTargets,
  getAutoFoundationTarget: getYukonAutoFoundation,
};
