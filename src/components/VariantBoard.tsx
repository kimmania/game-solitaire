import type { AnyGameState, VariantId } from '../game/registry';
import type { CanfieldState } from '../game/canfield/types';
import type { EightOffState } from '../game/eightoff/types';
import type { ScorpionState } from '../game/scorpion/types';
import type { FreeCellState } from '../game/freecell/types';
import type { EasthavenState } from '../game/easthaven/types';
import type { KlondikeState } from '../game/klondike/types';
import type { SpiderState } from '../game/spider/types';
import type { FortyThievesState } from '../game/fortythieves/types';
import type { PyramidState } from '../game/pyramid/types';
import type { TriPeaksState } from '../game/tripeaks/types';
import type { YukonState } from '../game/yukon/types';
import type { BoardProps } from './boardTypes';
import { CanfieldBoard } from './CanfieldBoard';
import { EightOffBoard } from './EightOffBoard';
import { ScorpionBoard } from './ScorpionBoard';
import { EasthavenBoard } from './EasthavenBoard';
import { FortyThievesBoard } from './FortyThievesBoard';
import { PyramidBoard } from './PyramidBoard';
import { TriPeaksBoard } from './TriPeaksBoard';
import { FreeCellBoard } from './FreeCellBoard';
import { KlondikeBoard } from './KlondikeBoard';
import { SpiderBoard } from './SpiderBoard';
import { YukonBoard } from './YukonBoard';

type Props = BoardProps<AnyGameState> & { variantId: VariantId };

export function VariantBoard({ variantId, state, ...handlers }: Props) {
  switch (variantId) {
    case 'klondike':
      return <KlondikeBoard state={state as KlondikeState} {...handlers} />;
    case 'freecell':
      return <FreeCellBoard state={state as FreeCellState} {...handlers} />;
    case 'eightoff':
      return <EightOffBoard state={state as EightOffState} {...handlers} />;
    case 'canfield':
      return <CanfieldBoard state={state as CanfieldState} {...handlers} />;
    case 'scorpion':
      return <ScorpionBoard state={state as ScorpionState} {...handlers} />;
    case 'spider':
    case 'spider-2':
    case 'spider-4':
      return <SpiderBoard state={state as SpiderState} {...handlers} />;
    case 'yukon':
      return <YukonBoard state={state as YukonState} {...handlers} />;
    case 'easthaven':
      return <EasthavenBoard state={state as EasthavenState} {...handlers} />;
    case 'pyramid':
      return (
        <PyramidBoard
          state={state as PyramidState}
          onDispatch={handlers.onDispatch}
        />
      );
    case 'tripeaks':
      return (
        <TriPeaksBoard
          state={state as TriPeaksState}
          onDispatch={handlers.onDispatch}
        />
      );
    case 'fortythieves':
      return <FortyThievesBoard state={state as FortyThievesState} {...handlers} />;
  }
}
