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
import { CANFIELD_COLUMNS, type CanfieldState } from './types';

function emptyFoundations(): Record<Suit, Card[]> {
  return { hearts: [], diamonds: [], clubs: [], spades: [] };
}

export function dealCanfield(seed?: number): CanfieldState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  let offset = 0;
  const starter = deck[offset++];
  starter.faceUp = true;
  const baseRank = starter.rank;

  const foundations = emptyFoundations();
  foundations[starter.suit] = [starter];

  const reserve: Card[] = [];
  for (let i = 0; i < 13; i++) {
    const card = deck[offset++];
    card.faceUp = true;
    reserve.push(card);
  }

  const tableau: Card[][] = Array.from({ length: CANFIELD_COLUMNS }, () => []);
  for (let col = 0; col < CANFIELD_COLUMNS; col++) {
    const card = deck[offset++];
    card.faceUp = true;
    tableau[col].push(card);
  }

  return {
    variantId: 'canfield',
    baseRank,
    tableau,
    foundations,
    reserve,
    stock: deck.slice(offset).map((c) => ({ ...c, faceUp: false })),
    waste: [],
    moves: 0,
  };
}

function getPile(state: CanfieldState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'stock':
      return state.stock;
    case 'waste':
      return state.waste;
    case 'reserve':
      return state.reserve;
    case 'foundation':
      if ('suit' in ref) return state.foundations[ref.suit];
      return [];
    case 'tableau':
      return state.tableau[ref.index];
    default:
      return [];
  }
}

function nextFoundationRank(pile: Card[], baseRank: Rank): Rank {
  if (pile.length === 0) return baseRank;
  const top = pile[pile.length - 1].rank;
  return (top === 13 ? 1 : top + 1) as Rank;
}

export function canPlaceOnFoundation(card: Card, foundation: Card[], baseRank: Rank): boolean {
  if (!card.faceUp) return false;
  const needed = nextFoundationRank(foundation, baseRank);
  return (
    card.rank === needed &&
    (foundation.length === 0 || card.suit === foundation[foundation.length - 1].suit)
  );
}

function canPlaceOnTableau(card: Card, target: Card[]): boolean {
  if (!card.faceUp) return false;
  if (target.length === 0) return true;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return suitColor(card.suit) !== suitColor(dest.suit) && card.rank === dest.rank - 1;
}

function isValidTableauStack(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  if (!cards[0].faceUp) return false;
  for (let i = 1; i < cards.length; i++) {
    const prev = cards[i - 1];
    const curr = cards[i];
    if (!curr.faceUp) return false;
    if (
      suitColor(prev.suit) === suitColor(curr.suit) ||
      prev.rank !== curr.rank + 1
    ) {
      return false;
    }
  }
  return true;
}

export function isCanfieldWon(state: CanfieldState): boolean {
  return Object.values(state.foundations).every((f) => f.length === 13);
}

export function canApplyCanfield(state: CanfieldState, action: GameAction): boolean {
  if (state.variantId !== 'canfield') return false;

  if (action.kind === 'flip-stock') {
    return state.stock.length > 0;
  }

  if (action.kind === 'recycle-waste') {
    return state.stock.length === 0 && state.waste.length > 0;
  }

  if (action.kind !== 'move-cards') return false;

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

  if (action.from.zone === 'reserve') {
    if (action.fromIndex !== state.reserve.length - 1 || action.count !== 1) return false;
  }

  if (action.from.zone === 'waste') {
    if (action.fromIndex !== state.waste.length - 1 || action.count !== 1) return false;
  }

  if (action.from.zone === 'tableau' && !isValidTableauStack(slice)) return false;

  const target = getPile(state, action.to);

  if (action.to.zone === 'foundation' && 'suit' in action.to) {
    if (action.count !== 1) return false;
    return canPlaceOnFoundation(slice[0], target, state.baseRank);
  }

  if (action.to.zone === 'tableau') {
    return canPlaceOnTableau(slice[0], target);
  }

  return false;
}

export function applyCanfield(state: CanfieldState, action: GameAction): CanfieldState {
  if (!canApplyCanfield(state, action)) return state;

  const next: CanfieldState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    foundations: {
      hearts: [...state.foundations.hearts],
      diamonds: [...state.foundations.diamonds],
      clubs: [...state.foundations.clubs],
      spades: [...state.foundations.spades],
    },
    reserve: [...state.reserve],
    stock: [...state.stock],
    waste: [...state.waste],
    moves: state.moves + 1,
  };

  switch (action.kind) {
    case 'flip-stock': {
      const card = next.stock.pop()!;
      card.faceUp = true;
      next.waste.push(card);
      break;
    }
    case 'recycle-waste': {
      while (next.waste.length > 0) {
        const card = next.waste.pop()!;
        card.faceUp = false;
        next.stock.unshift(card);
      }
      break;
    }
    case 'move-cards': {
      const source = getPile(next, action.from);
      const moving = source.splice(action.fromIndex, action.count);
      getPile(next, action.to).push(...moving);
      break;
    }
  }

  return next;
}

export function getCanfieldTargets(
  state: CanfieldState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  if (from.zone === 'waste' || from.zone === 'tableau' || from.zone === 'reserve') {
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      const ref: PileRef = { zone: 'foundation', suit };
      if (canApplyCanfield(state, { ...actionBase, to: ref })) targets.push(ref);
    }
  }

  for (let i = 0; i < CANFIELD_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplyCanfield(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getCanfieldAutoFoundation(
  state: CanfieldState,
  from: PileRef,
  fromIndex: number,
): PileRef | null {
  const pile = getPile(state, from);
  if (fromIndex !== pile.length - 1) return null;
  const foundationTargets = getCanfieldTargets(state, from, fromIndex, 1).filter(
    (t) => t.zone === 'foundation',
  );
  if (foundationTargets.length === 0) return null;
  return foundationTargets[0];
}

export function wasteTopSelectable(state: CanfieldState): boolean {
  return state.waste.length > 0;
}

export function reserveTopSelectable(state: CanfieldState): boolean {
  return state.reserve.length > 0;
}

export function tableauSelectableRange(
  column: Card[],
  cardIndex: number,
): { fromIndex: number; count: number } | null {
  const card = column[cardIndex];
  if (!card?.faceUp) return null;
  return { fromIndex: cardIndex, count: column.length - cardIndex };
}
