import type { SolitaireVariant } from '../variant';
import { applyClock, canApplyClock, dealClock, isClockWon } from './rules';
import type { ClockState } from './types';

export const clockVariant: SolitaireVariant<ClockState> = {
  meta: {
    id: 'clock',
    name: 'Clock',
    description:
      'Turn cards onto their hour pile — win before the fourth king reaches the center.',
  },
  createInitialState: (seed) => dealClock(seed),
  isWon: isClockWon,
  canApply: canApplyClock,
  apply: applyClock,
  getTargetsForSelection: () => [],
  getAutoFoundationTarget: () => null,
};
