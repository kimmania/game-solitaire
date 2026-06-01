import type { Card } from './cards';

/** Identifies a pile within any solitaire variant. */
export type PileRef =
  | { zone: 'stock' }
  | { zone: 'waste' }
  | { zone: 'foundation'; suit: Card['suit'] }
  | { zone: 'foundation'; index: number }
  | { zone: 'tableau'; index: number }
  | { zone: 'freecell'; index: number }
  | { zone: 'reserve' };

export interface MoveCardsAction {
  kind: 'move-cards';
  from: PileRef;
  to: PileRef;
  /** Index of first card to move within the source pile (0 = bottom). */
  fromIndex: number;
  count: number;
}

export interface FlipStockAction {
  kind: 'flip-stock';
}

export interface RecycleWasteAction {
  kind: 'recycle-waste';
}

export interface DealSpiderRowAction {
  kind: 'deal-spider-row';
}

export interface DealScorpionStockAction {
  kind: 'deal-scorpion-stock';
}

export type PyramidPick =
  | { zone: 'pyramid'; row: number; col: number }
  | { zone: 'waste' };

export interface RemovePyramidCardsAction {
  kind: 'remove-pyramid-cards';
  picks: PyramidPick[];
}

export type TriPeaksPick = { zone: 'tripeaks'; row: number; col: number };

export interface PlayTriPeaksCardAction {
  kind: 'play-tripeaks-card';
  pick: TriPeaksPick;
}

export type GameAction =
  | MoveCardsAction
  | FlipStockAction
  | RecycleWasteAction
  | DealSpiderRowAction
  | DealScorpionStockAction
  | RemovePyramidCardsAction
  | PlayTriPeaksCardAction;

export interface VariantMeta {
  id: string;
  name: string;
  description: string;
}

/** Contract each solitaire ruleset implements. */
export interface SolitaireVariant<State> {
  meta: VariantMeta;
  createInitialState(seed?: number): State;
  isWon(state: State): boolean;
  canApply(state: State, action: GameAction): boolean;
  apply(state: State, action: GameAction): State;
  /** Legal destinations for a selection (used by UI). */
  getTargetsForSelection(
    state: State,
    from: PileRef,
    fromIndex: number,
    count: number,
  ): PileRef[];
  /** Auto-move to foundation when unambiguous (double-tap). */
  getAutoFoundationTarget(state: State, from: PileRef, fromIndex: number): PileRef | null;
}
