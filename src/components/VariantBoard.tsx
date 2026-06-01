import type { AnyGameState, VariantId } from '../game/registry';
import type { FreeCellState } from '../game/freecell/types';
import type { KlondikeState } from '../game/klondike/types';
import type { SpiderState } from '../game/spider/types';
import type { BoardProps } from './boardTypes';
import { FreeCellBoard } from './FreeCellBoard';
import { KlondikeBoard } from './KlondikeBoard';
import { SpiderBoard } from './SpiderBoard';

type Props = BoardProps<AnyGameState> & { variantId: VariantId };

export function VariantBoard({ variantId, state, ...handlers }: Props) {
  switch (variantId) {
    case 'klondike':
      return <KlondikeBoard state={state as KlondikeState} {...handlers} />;
    case 'freecell':
      return <FreeCellBoard state={state as FreeCellState} {...handlers} />;
    case 'spider':
      return <SpiderBoard state={state as SpiderState} {...handlers} />;
  }
}
