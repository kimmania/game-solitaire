import type { AnyGameState, VariantId } from '../game/registry';
import type { FreeCellState } from '../game/freecell/types';
import type { EasthavenState } from '../game/easthaven/types';
import type { KlondikeState } from '../game/klondike/types';
import type { SpiderState } from '../game/spider/types';
import type { YukonState } from '../game/yukon/types';
import type { BoardProps } from './boardTypes';
import { EasthavenBoard } from './EasthavenBoard';
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
    case 'spider':
    case 'spider-2':
    case 'spider-4':
      return <SpiderBoard state={state as SpiderState} {...handlers} />;
    case 'yukon':
      return <YukonBoard state={state as YukonState} {...handlers} />;
    case 'easthaven':
      return <EasthavenBoard state={state as EasthavenState} {...handlers} />;
  }
}
