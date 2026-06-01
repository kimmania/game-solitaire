import {
  createDeck,
  shuffle,
  suitColor,
  type Card,
  type Rank,
  type Suit,
} from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PileRef } from '../variant';
import { YUKON_COLUMNS, type YukonState } from './types';

function emptyFoundations(): Record<Suit, Card[]> {
  return { hearts: [], diamonds: [], clubs: [], spades: [] };
}

export function dealYukon(seed?: number): YukonState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const tableau: Card[][] = Array.from({ length: YUKON_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < YUKON_COLUMNS; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[offset++];
      card.faceUp = true;
      tableau[col].push(card);
    }
  }

  for (let col = 1; col < YUKON_COLUMNS; col++) {
    for (let i = 0; i < 4; i++) {
      const card = deck[offset++];
      card.faceUp = true;
      tableau[col].push(card);
    }
  }

  return {
    variantId: 'yukon',
    tableau,
    foundations: emptyFoundations(),
    moves: 0,
  };
}

function getPile(state: YukonState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'foundation':
      if ('suit' in ref) return state.foundations[ref.suit];
      return [];
    case 'tableau':
      return state.tableau[ref.index];
    default:
      return [];
  }
}

function nextFoundationRank(pile: Card[]): Rank {
  if (pile.length === 0) return 1;
  return (pile[pile.length - 1].rank + 1) as Rank;
}

export function canPlaceOnFoundation(card: Card, foundation: Card[]): boolean {
  if (!card.faceUp) return false;
  return (
    card.rank === nextFoundationRank(foundation) &&
    (foundation.length === 0 || foundation[foundation.length - 1].suit === card.suit)
  );
}

function canPlaceOnTableau(card: Card, target: Card[]): boolean {
  if (!card.faceUp) return false;
  if (target.length === 0) return card.rank === 13;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return suitColor(card.suit) !== suitColor(dest.suit) && card.rank === dest.rank - 1;
}

/** Yukon: any face-up run moves; only the bottom card of the run must attach legally. */
function canMoveYukonStack(cards: Card[], target: Card[]): boolean {
  if (cards.length === 0) return false;
  if (!cards.every((c) => c.faceUp)) return false;
  return canPlaceOnTableau(cards[0], target);
}

export function isYukonWon(state: YukonState): boolean {
  return Object.values(state.foundations).every((f) => f.length === 13);
}

export function canApplyYukon(state: YukonState, action: GameAction): boolean {
  if (state.variantId !== 'yukon' || action.kind !== 'move-cards') return false;

  if (action.from.zone === action.to.zone) {
    if (action.from.zone === 'tableau') {
      const from = action.from as { zone: 'tableau'; index: number };
      const to = action.to as { zone: 'tableau'; index: number };
      if (from.index === to.index) return false;
    } else return false;
  }

  const source = getPile(state, action.from);
  const slice = source.slice(action.fromIndex);
  if (slice.length !== action.count || slice.length === 0) return false;

  if (action.from.zone === 'foundation') return false;

  const target = getPile(state, action.to);

  if (action.to.zone === 'foundation') {
    if (action.count !== 1) return false;
    const suit = (action.to as { zone: 'foundation'; suit: Suit }).suit;
    return slice[0].suit === suit && canPlaceOnFoundation(slice[0], target);
  }

  if (action.to.zone === 'tableau') {
    return canMoveYukonStack(slice, target);
  }

  return false;
}

export function applyYukon(state: YukonState, action: GameAction): YukonState {
  if (!canApplyYukon(state, action) || action.kind !== 'move-cards') return state;

  const next: YukonState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    foundations: {
      hearts: [...state.foundations.hearts],
      diamonds: [...state.foundations.diamonds],
      clubs: [...state.foundations.clubs],
      spades: [...state.foundations.spades],
    },
    moves: state.moves + 1,
  };

  const source = getPile(next, action.from);
  const moving = source.splice(action.fromIndex, action.count);
  getPile(next, action.to).push(...moving);

  return next;
}

export function getYukonTargets(
  state: YukonState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  if (from.zone === 'tableau') {
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      const ref: PileRef = { zone: 'foundation', suit };
      if (canApplyYukon(state, { ...actionBase, to: ref })) targets.push(ref);
    }
  }

  for (let i = 0; i < YUKON_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplyYukon(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getYukonAutoFoundation(
  state: YukonState,
  from: PileRef,
  fromIndex: number,
): PileRef | null {
  const pile = getPile(state, from);
  if (fromIndex !== pile.length - 1) return null;
  const targets = getYukonTargets(state, from, fromIndex, 1).filter(
    (t) => t.zone === 'foundation',
  );
  return targets.length === 1 ? targets[0] : null;
}

export function tableauSelectableRange(
  column: Card[],
  cardIndex: number,
): { fromIndex: number; count: number } | null {
  const card = column[cardIndex];
  if (!card?.faceUp) return null;
  return { fromIndex: cardIndex, count: column.length - cardIndex };
}
