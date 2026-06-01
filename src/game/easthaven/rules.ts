import {
  createDeck,
  shuffle,
  type Card,
  type Rank,
  type Suit,
} from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PileRef } from '../variant';
import { EASTHAVEN_COLUMNS, type EasthavenState } from './types';

function emptyFoundations(): Record<Suit, Card[]> {
  return { hearts: [], diamonds: [], clubs: [], spades: [] };
}

export function dealEasthaven(seed?: number): EasthavenState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const tableau: Card[][] = Array.from({ length: EASTHAVEN_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < EASTHAVEN_COLUMNS; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[offset++];
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }

  return {
    variantId: 'easthaven',
    tableau,
    foundations: emptyFoundations(),
    stock: deck.slice(offset).map((c) => ({ ...c, faceUp: false })),
    waste: [],
    hasRecycled: false,
    moves: 0,
  };
}

function getPile(state: EasthavenState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'stock':
      return state.stock;
    case 'waste':
      return state.waste;
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
  if (target.length === 0) return true;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return card.suit === dest.suit && card.rank === dest.rank - 1;
}

export function isEasthavenWon(state: EasthavenState): boolean {
  return Object.values(state.foundations).every((f) => f.length === 13);
}

export function canApplyEasthaven(state: EasthavenState, action: GameAction): boolean {
  if (state.variantId !== 'easthaven') return false;

  if (action.kind === 'flip-stock') {
    return state.stock.length > 0;
  }

  if (action.kind === 'recycle-waste') {
    return state.stock.length === 0 && state.waste.length > 0 && !state.hasRecycled;
  }

  if (action.kind !== 'move-cards') return false;

  if (action.from.zone === action.to.zone) {
    if (action.from.zone === 'tableau') {
      const from = action.from as { zone: 'tableau'; index: number };
      const to = action.to as { zone: 'tableau'; index: number };
      if (from.index === to.index) return false;
    } else return false;
  }

  if (action.count !== 1) return false;

  const source = getPile(state, action.from);
  const slice = source.slice(action.fromIndex);
  if (slice.length !== 1) return false;

  if (action.from.zone === 'foundation') return false;

  const target = getPile(state, action.to);

  if (action.to.zone === 'foundation') {
    const suit = (action.to as { zone: 'foundation'; suit: Suit }).suit;
    return slice[0].suit === suit && canPlaceOnFoundation(slice[0], target);
  }

  if (action.to.zone === 'tableau') {
    return canPlaceOnTableau(slice[0], target);
  }

  if (action.to.zone === 'waste') return false;

  return false;
}

export function applyEasthaven(state: EasthavenState, action: GameAction): EasthavenState {
  if (!canApplyEasthaven(state, action)) return state;

  const next: EasthavenState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    foundations: {
      hearts: [...state.foundations.hearts],
      diamonds: [...state.foundations.diamonds],
      clubs: [...state.foundations.clubs],
      spades: [...state.foundations.spades],
    },
    stock: [...state.stock],
    waste: [...state.waste],
    hasRecycled: state.hasRecycled,
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
      next.hasRecycled = true;
      break;
    }
    case 'move-cards': {
      const source = getPile(next, action.from);
      const moving = source.splice(action.fromIndex, 1);
      getPile(next, action.to).push(...moving);

      if (action.from.zone === 'tableau') {
        const col = next.tableau[(action.from as { zone: 'tableau'; index: number }).index];
        const flipped = col[col.length - 1];
        if (flipped && !flipped.faceUp) flipped.faceUp = true;
      }
      break;
    }
  }

  return next;
}

export function getEasthavenTargets(
  state: EasthavenState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  if (count !== 1) return [];

  const actionBase = { from, fromIndex, count: 1, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  if (from.zone === 'waste' || from.zone === 'tableau') {
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      const ref: PileRef = { zone: 'foundation', suit };
      if (canApplyEasthaven(state, { ...actionBase, to: ref })) targets.push(ref);
    }
  }

  for (let i = 0; i < EASTHAVEN_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplyEasthaven(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getEasthavenAutoFoundation(
  state: EasthavenState,
  from: PileRef,
  fromIndex: number,
): PileRef | null {
  const pile = getPile(state, from);
  if (fromIndex !== pile.length - 1) return null;
  const targets = getEasthavenTargets(state, from, fromIndex, 1).filter(
    (t) => t.zone === 'foundation',
  );
  return targets.length === 1 ? targets[0] : null;
}

export function wasteTopSelectable(state: EasthavenState): boolean {
  return state.waste.length > 0;
}

export function tableauSelectableRange(
  column: Card[],
  cardIndex: number,
): { fromIndex: number; count: number } | null {
  const card = column[cardIndex];
  if (!card?.faceUp) return null;
  return { fromIndex: cardIndex, count: 1 };
}
