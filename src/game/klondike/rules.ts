import {
  createDeck,
  shuffle,
  suitColor,
  type Card,
  type Rank,
  type Suit,
} from '../cards';
import type { GameAction, PileRef } from '../variant';
import { TABLEAU_COLUMNS, type KlondikeState } from './types';

function emptyFoundations(): Record<Suit, Card[]> {
  return { hearts: [], diamonds: [], clubs: [], spades: [] };
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function dealKlondike(seed?: number): KlondikeState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const tableau: Card[][] = Array.from({ length: TABLEAU_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < TABLEAU_COLUMNS; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck[offset++];
      card.faceUp = row === col;
      tableau[col].push(card);
    }
  }

  const stock = deck.slice(offset).map((c) => ({ ...c, faceUp: false }));

  return {
    variantId: 'klondike',
    tableau,
    foundations: emptyFoundations(),
    stock,
    waste: [],
    moves: 0,
  };
}

function getPile(state: KlondikeState, ref: PileRef): Card[] {
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
  return card.rank === nextFoundationRank(foundation) && (foundation.length === 0 || foundation[foundation.length - 1].suit === card.suit);
}

function canPlaceOnTableau(card: Card, target: Card[]): boolean {
  if (!card.faceUp) return false;
  if (target.length === 0) return card.rank === 13;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return suitColor(card.suit) !== suitColor(dest.suit) && card.rank === dest.rank - 1;
}

function canMoveStack(cards: Card[], target: Card[]): boolean {
  if (cards.length === 0) return false;
  if (!cards[0].faceUp) return false;
  for (let i = 1; i < cards.length; i++) {
    const prev = cards[i - 1];
    const curr = cards[i];
    if (!curr.faceUp) return false;
    if (suitColor(prev.suit) === suitColor(curr.suit) || prev.rank !== curr.rank + 1) {
      return false;
    }
  }
  return canPlaceOnTableau(cards[0], target);
}

export function isKlondikeWon(state: KlondikeState): boolean {
  return Object.values(state.foundations).every((f) => f.length === 13);
}

export function canApplyKlondike(state: KlondikeState, action: GameAction): boolean {
  switch (action.kind) {
    case 'flip-stock':
      return state.stock.length > 0;
    case 'recycle-waste':
      return state.stock.length === 0 && state.waste.length > 0;
    case 'move-cards': {
      if (action.from.zone === action.to.zone) {
        if (action.from.zone === 'tableau' && action.from.zone === action.to.zone) {
          const fromRef = action.from as { zone: 'tableau'; index: number };
          const toRef = action.to as { zone: 'tableau'; index: number };
          if (fromRef.index === toRef.index) return false;
        } else return false;
      }
      const source = getPile(state, action.from);
      const slice = source.slice(action.fromIndex);
      if (slice.length !== action.count) return false;
      const target = getPile(state, action.to);
      if (action.to.zone === 'foundation') {
        if (action.count !== 1) return false;
        const foundationSuit = (action.to as { zone: 'foundation'; suit: Suit }).suit;
        return slice[0].suit === foundationSuit && canPlaceOnFoundation(slice[0], target);
      }
      return canMoveStack(slice, target);
    }
    default:
      return false;
  }
}

export function applyKlondike(state: KlondikeState, action: GameAction): KlondikeState {
  if (!canApplyKlondike(state, action)) return state;

  const next: KlondikeState = {
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

export function getKlondikeTargets(
  state: KlondikeState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  if (from.zone === 'waste' || from.zone === 'tableau') {
    const card = getPile(state, from)[fromIndex];
    if (!card) return targets;
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      const ref: PileRef = { zone: 'foundation', suit };
      if (canApplyKlondike(state, { ...actionBase, to: ref })) targets.push(ref);
    }
  }

  for (let i = 0; i < TABLEAU_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplyKlondike(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getKlondikeAutoFoundation(
  state: KlondikeState,
  from: PileRef,
  fromIndex: number,
): PileRef | null {
  const pile = getPile(state, from);
  if (fromIndex !== pile.length - 1) return null;
  const card = pile[fromIndex];
  if (!card?.faceUp) return null;

  const targets = getKlondikeTargets(state, from, fromIndex, 1).filter(
    (t) => t.zone === 'foundation',
  );
  return targets.length === 1 ? targets[0] : null;
}

export function wasteTopSelectable(state: KlondikeState): boolean {
  return state.waste.length > 0;
}

export function tableauSelectableRange(
  column: Card[],
  cardIndex: number,
): { fromIndex: number; count: number } | null {
  const card = column[cardIndex];
  if (!card?.faceUp) return null;
  return { fromIndex: cardIndex, count: column.length - cardIndex };
}
