import { createDeck, shuffle, type Card, type Rank, type Suit } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PileRef } from '../variant';
import {
  BELEAGUERED_COLUMNS,
  BELEAGUERED_RESERVES,
  type BeleagueredCastleState,
} from './types';

function emptyFoundations(): Record<Suit, Card[]> {
  return { hearts: [], diamonds: [], clubs: [], spades: [] };
}

export function dealBeleagueredCastle(seed?: number): BeleagueredCastleState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const foundations = emptyFoundations();
  const reserves: (Card | null)[] = Array.from({ length: BELEAGUERED_RESERVES }, () => null);
  const tableau: Card[][] = Array.from({ length: BELEAGUERED_COLUMNS }, () => []);

  const remaining: Card[] = [];

  for (const card of deck) {
    if (card.rank === 1) {
      card.faceUp = true;
      foundations[card.suit].push(card);
    } else {
      remaining.push(card);
    }
  }

  let col = 0;
  for (const card of remaining) {
    card.faceUp = true;
    while (tableau[col].length >= 6) {
      col = (col + 1) % BELEAGUERED_COLUMNS;
    }
    tableau[col].push(card);
    col = (col + 1) % BELEAGUERED_COLUMNS;
  }

  for (let i = 0; i < BELEAGUERED_COLUMNS; i++) {
    if (tableau[i][0]?.rank === 13) {
      const king = tableau[i].shift()!;
      const slot = reserves.findIndex((c) => c === null);
      if (slot !== -1) reserves[slot] = king;
    }
  }

  return {
    variantId: 'beleagueredcastle',
    tableau,
    reserves,
    foundations,
    moves: 0,
  };
}

function getPile(state: BeleagueredCastleState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'foundation':
      if ('suit' in ref) return state.foundations[ref.suit];
      return [];
    case 'tableau':
      return state.tableau[ref.index];
    case 'reserve':
      if ('index' in ref) {
        const card = state.reserves[ref.index];
        return card ? [card] : [];
      }
      return [];
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
  if (target.length === 0) return true;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return card.suit === dest.suit && card.rank === dest.rank - 1;
}

export function isBeleagueredCastleWon(state: BeleagueredCastleState): boolean {
  return Object.values(state.foundations).every((f) => f.length === 13);
}

export function canApplyBeleagueredCastle(
  state: BeleagueredCastleState,
  action: GameAction,
): boolean {
  if (state.variantId !== 'beleagueredcastle') return false;
  if (action.kind !== 'move-cards') return false;
  if (action.count !== 1) return false;

  if (action.from.zone === action.to.zone) {
    if (action.from.zone === 'tableau') {
      const from = action.from as { zone: 'tableau'; index: number };
      const to = action.to as { zone: 'tableau'; index: number };
      if (from.index === to.index) return false;
    } else return false;
  }

  const source = getPile(state, action.from);
  if (action.from.zone === 'reserve' && 'index' in action.from) {
    if (!state.reserves[action.from.index]) return false;
    if (action.fromIndex !== 0) return false;
  } else if (action.from.zone === 'tableau') {
    if (action.fromIndex !== source.length - 1) return false;
  } else return false;

  const card = source[action.fromIndex];
  if (!card?.faceUp) return false;

  const target = getPile(state, action.to);

  if (action.to.zone === 'foundation' && 'suit' in action.to) {
    return canPlaceOnFoundation(card, target);
  }

  if (action.to.zone === 'tableau') {
    if (target.length === 0) {
      if (action.from.zone === 'reserve') return true;
      return true;
    }
    return canPlaceOnTableau(card, target);
  }

  return false;
}

export function applyBeleagueredCastle(
  state: BeleagueredCastleState,
  action: GameAction,
): BeleagueredCastleState {
  if (!canApplyBeleagueredCastle(state, action)) return state;

  const next: BeleagueredCastleState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    reserves: [...state.reserves],
    foundations: {
      hearts: [...state.foundations.hearts],
      diamonds: [...state.foundations.diamonds],
      clubs: [...state.foundations.clubs],
      spades: [...state.foundations.spades],
    },
    moves: state.moves + 1,
  };

  if (action.kind !== 'move-cards') return state;

  const source = getPile(next, action.from);
  const moving = source.splice(action.fromIndex, action.count);

  if (action.from.zone === 'reserve' && 'index' in action.from) {
    next.reserves[action.from.index] = null;
  }

  getPile(next, action.to).push(...moving);

  return next;
}

export function getBeleagueredCastleTargets(
  state: BeleagueredCastleState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  if (from.zone === 'tableau' || from.zone === 'reserve') {
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      const ref: PileRef = { zone: 'foundation', suit };
      if (canApplyBeleagueredCastle(state, { ...actionBase, to: ref })) {
        targets.push(ref);
      }
    }
  }

  for (let i = 0; i < BELEAGUERED_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplyBeleagueredCastle(state, { ...actionBase, to: ref })) {
      targets.push(ref);
    }
  }

  return targets;
}

export function getBeleagueredCastleAutoFoundation(
  state: BeleagueredCastleState,
  from: PileRef,
  fromIndex: number,
): PileRef | null {
  const pile = getPile(state, from);
  if (fromIndex !== pile.length - 1) return null;
  const foundationTargets = getBeleagueredCastleTargets(state, from, fromIndex, 1).filter(
    (t) => t.zone === 'foundation',
  );
  if (foundationTargets.length === 0) return null;
  return foundationTargets[0];
}

export function tableauTopSelectable(column: Card[], cardIndex: number): boolean {
  return cardIndex === column.length - 1 && Boolean(column[cardIndex]?.faceUp);
}
