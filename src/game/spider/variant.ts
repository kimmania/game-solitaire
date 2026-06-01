import type { SolitaireVariant } from '../variant';
import {
  applySpider,
  canApplySpider,
  dealSpider,
  getSpiderTargets,
  isSpiderWon,
} from './rules';
import type { SpiderState } from './types';

export const spiderVariant: SolitaireVariant<SpiderState> = {
  meta: {
    id: 'spider',
    name: 'Spider (1 suit)',
    description: 'Build descending sequences in one suit — clear eight runs from King to Ace.',
  },
  createInitialState: (seed) => dealSpider(seed),
  isWon: isSpiderWon,
  canApply: canApplySpider,
  apply: applySpider,
  getTargetsForSelection: getSpiderTargets,
  getAutoFoundationTarget: () => null,
};
