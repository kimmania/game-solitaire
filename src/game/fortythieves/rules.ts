import {
  createDoubleDeck,
  shuffle,
  SUITS,
  type Card,
  type Rank,
  type Suit,
} from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PileRef } from '../variant';
import {
  FORTY_THIEVES_COLUMNS,
  FORTY_THIEVES_FOUNDATIONS,
  type FortyThievesState,
} from './types';

export function foundationSuitForIndex(index: number): Suit {
  return SUITS[Math.floor(index / 2)];
}

export function dealFortyThieves(seed?: number): FortyThievesState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDoubleDeck(), random);

  const tableau: Card[][] = Array.from({ length: FORTY_THIEVES_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < FORTY_THIEVES_COLUMNS; col++) {
    for (let i = 0; i < 4; i++) {
      const card = deck[offset++];
      card.faceUp = true;
      tableau[col].push(card);
    }
  }

  return {
    variantId: 'fortythieves',
    tableau,
    foundations: Array.from({ length: FORTY_THIEVES_FOUNDATIONS }, () => []),
    stock: deck.slice(offset).map((c) => ({ ...c, faceUp: false })),
    waste: [],
    moves: 0,
  };
}

function getPile(state: FortyThievesState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'stock':
      return state.stock;
    case 'waste':
      return state.waste;
    case 'foundation':
      if ('index' in ref) return state.foundations[ref.index] ?? [];
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

export function canPlaceOnFoundation(
  card: Card,
  foundation: Card[],
  foundationIndex: number,
): boolean {
  if (!card.faceUp) return false;
  if (card.suit !== foundationSuitForIndex(foundationIndex)) return false;
  if (foundation.length === 0) return card.rank === 1;
  const top = foundation[foundation.length - 1];
  return card.suit === top.suit && card.rank === nextFoundationRank(foundation);
}

export function canPlaceOnTableau(card: Card, target: Card[]): boolean {
  if (!card.faceUp) return false;
  if (target.length === 0) return card.rank === 13;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return card.suit === dest.suit && card.rank === dest.rank - 1;
}

export function isFortyThievesWon(state: FortyThievesState): boolean {
  return state.foundations.every((f) => f.length === 13);
}

export function canApplyFortyThieves(state: FortyThievesState, action: GameAction): boolean {
  if (state.variantId !== 'fortythieves') return false;

  switch (action.kind) {
    case 'flip-stock':
      return state.stock.length > 0;
    case 'recycle-waste':
      return state.stock.length === 0 && state.waste.length > 0;
    case 'move-cards': {
      if (action.count !== 1) return false;
      if (action.from.zone === action.to.zone) {
        if (action.from.zone === 'tableau' && action.to.zone === 'tableau') {
          const fromCol = (action.from as { zone: 'tableau'; index: number }).index;
          const toCol = (action.to as { zone: 'tableau'; index: number }).index;
          if (fromCol === toCol) return false;
        } else {
          return false;
        }
      }

      const source = getPile(state, action.from);
      if (action.fromIndex !== source.length - 1) return false;
      const card = source[action.fromIndex];
      if (!card?.faceUp) return false;

      const target = getPile(state, action.to);
      if (action.to.zone === 'foundation' && 'index' in action.to) {
        return canPlaceOnFoundation(card, target, action.to.index);
      }
      if (action.to.zone === 'tableau') {
        return canPlaceOnTableau(card, target);
      }
      return false;
    }
    default:
      return false;
  }
}

export function applyFortyThieves(
  state: FortyThievesState,
  action: GameAction,
): FortyThievesState {
  if (!canApplyFortyThieves(state, action)) return state;

  const next: FortyThievesState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    foundations: state.foundations.map((f) => [...f]),
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

export function getFortyThievesTargets(
  state: FortyThievesState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  if (from.zone !== 'waste' && from.zone !== 'tableau') return targets;

  for (let i = 0; i < FORTY_THIEVES_FOUNDATIONS; i++) {
    const ref: PileRef = { zone: 'foundation', index: i };
    if (canApplyFortyThieves(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  for (let i = 0; i < FORTY_THIEVES_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplyFortyThieves(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getFortyThievesAutoFoundation(
  state: FortyThievesState,
  from: PileRef,
  fromIndex: number,
): PileRef | null {
  const pile = getPile(state, from);
  if (fromIndex !== pile.length - 1) return null;
  const card = pile[fromIndex];
  if (!card?.faceUp) return null;

  const foundationTargets = getFortyThievesTargets(state, from, fromIndex, 1).filter(
    (t) => t.zone === 'foundation',
  );
  if (foundationTargets.length === 0) return null;
  return foundationTargets.reduce((best, t) =>
    'index' in t && 'index' in best && t.index < best.index ? t : best,
  );
}

export function wasteTopSelectable(state: FortyThievesState): boolean {
  return state.waste.length > 0;
}

export function tableauTopSelectable(column: Card[], cardIndex: number): boolean {
  return cardIndex === column.length - 1 && Boolean(column[cardIndex]?.faceUp);
}
