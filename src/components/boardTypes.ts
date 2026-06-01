import type { Selection } from '../hooks/useGame';
import type { GameAction, PileRef } from '../game/variant';

export interface BoardProps<State> {
  state: State;
  selection: Selection | null;
  targets: PileRef[];
  onSelect: (from: PileRef, fromIndex: number, count: number) => void;
  onClearSelection: () => void;
  onDispatch: (action: GameAction) => void;
  onTryMoveTo: (to: PileRef) => boolean;
  onAutoFoundation: (from: PileRef, fromIndex: number) => void;
}
