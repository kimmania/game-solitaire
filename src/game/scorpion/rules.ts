import { createDeck, shuffle, type Card, type Rank } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PileRef } from '../variant';
import {
  SCORPION_COLUMNS,
  SCORPION_DEAL_COLUMNS,
  SCORPION_FOUNDATIONS,
  SCORPION_SEQUENCE_LENGTH,
  type ScorpionState,
} from './types';

export function dealScorpion(seed?: number): ScorpionState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const tableau: Card[][] = Array.from({ length: SCORPION_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 7; row++) {
      const card = deck[offset++];
      card.faceUp = row >= 3;
      tableau[col].push(card);
    }
  }

  for (let col = 4; col < SCORPION_COLUMNS; col++) {
    for (let i = 0; i < 3; i++) {
      const card = deck[offset++];
      card.faceUp = true;
      tableau[col].push(card);
    }
  }

  return {
    variantId: 'scorpion',
    tableau,
    stock: deck.slice(offset).map((c) => ({ ...c, faceUp: false })),
    foundations: 0,
    moves: 0,
  };
}

function getPile(state: ScorpionState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'stock':
      return state.stock;
    case 'tableau':
      return state.tableau[ref.index];
    default:
      return [];
  }
}

function isValidScorpionStack(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  if (!cards[0].faceUp) return false;
  const stackSuit = cards[0].suit;
  for (let i = 1; i < cards.length; i++) {
    const prev = cards[i - 1];
    const curr = cards[i];
    if (!curr.faceUp) return false;
    if (curr.suit !== stackSuit || prev.rank !== curr.rank + 1) return false;
  }
  return true;
}

function canPlaceOnTableau(card: Card, target: Card[]): boolean {
  if (!card.faceUp) return false;
  if (target.length === 0) return card.rank === 13;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return card.suit === dest.suit && card.rank === dest.rank - 1;
}

function canMoveScorpionStack(cards: Card[], target: Card[]): boolean {
  if (!isValidScorpionStack(cards)) return false;
  return canPlaceOnTableau(cards[0], target);
}

function isCompleteSequence(cards: Card[]): boolean {
  if (cards.length !== SCORPION_SEQUENCE_LENGTH) return false;
  const sequenceSuit = cards[0].suit;
  for (let i = 0; i < SCORPION_SEQUENCE_LENGTH; i++) {
    if (!cards[i].faceUp) return false;
    if (cards[i].rank !== (SCORPION_SEQUENCE_LENGTH - i) as Rank) return false;
    if (cards[i].suit !== sequenceSuit) return false;
  }
  return true;
}

function removeCompleteSequences(state: ScorpionState): void {
  for (const col of state.tableau) {
    while (col.length >= SCORPION_SEQUENCE_LENGTH) {
      const start = col.length - SCORPION_SEQUENCE_LENGTH;
      const tail = col.slice(start);
      if (!isCompleteSequence(tail)) break;
      col.splice(start, SCORPION_SEQUENCE_LENGTH);
      state.foundations++;
      const flipped = col[col.length - 1];
      if (flipped && !flipped.faceUp) flipped.faceUp = true;
    }
  }
}

export function hasEmptyTableau(state: ScorpionState): boolean {
  return state.tableau.some((col) => col.length === 0);
}

export function isScorpionWon(state: ScorpionState): boolean {
  return state.foundations >= SCORPION_FOUNDATIONS;
}

export function canApplyScorpion(state: ScorpionState, action: GameAction): boolean {
  if (state.variantId !== 'scorpion') return false;

  if (action.kind === 'deal-scorpion-stock') {
    return state.stock.length > 0 && !hasEmptyTableau(state);
  }

  if (action.kind !== 'move-cards') return false;

  if (action.from.zone === action.to.zone) {
    if (action.from.zone === 'tableau') {
      const from = action.from as { zone: 'tableau'; index: number };
      const to = action.to as { zone: 'tableau'; index: number };
      if (from.index === to.index) return false;
    } else return false;
  }

  if (action.from.zone !== 'tableau' || action.to.zone !== 'tableau') return false;

  const source = getPile(state, action.from);
  const slice = source.slice(action.fromIndex);
  if (slice.length !== action.count || slice.length === 0) return false;

  const target = getPile(state, action.to);
  return canMoveScorpionStack(slice, target);
}

export function applyScorpion(state: ScorpionState, action: GameAction): ScorpionState {
  if (!canApplyScorpion(state, action)) return state;

  const next: ScorpionState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    stock: [...state.stock],
    foundations: state.foundations,
    moves: state.moves + 1,
  };

  if (action.kind === 'deal-scorpion-stock') {
    for (let col = 0; col < SCORPION_DEAL_COLUMNS && next.stock.length > 0; col++) {
      const card = next.stock.pop()!;
      card.faceUp = true;
      next.tableau[col].push(card);
    }
    removeCompleteSequences(next);
    return next;
  }

  if (action.kind !== 'move-cards') return state;

  const source = getPile(next, action.from);
  const moving = source.splice(action.fromIndex, action.count);
  getPile(next, action.to).push(...moving);

  const fromCol = next.tableau[(action.from as { zone: 'tableau'; index: number }).index];
  const flipped = fromCol[fromCol.length - 1];
  if (flipped && !flipped.faceUp) flipped.faceUp = true;

  removeCompleteSequences(next);
  return next;
}

export function getScorpionTargets(
  state: ScorpionState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  if (from.zone !== 'tableau') return [];

  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  for (let i = 0; i < SCORPION_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.index === i) continue;
    if (canApplyScorpion(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getScorpionAutoFoundation(): null {
  return null;
}

export function tableauSelectableRange(
  column: Card[],
  cardIndex: number,
): { fromIndex: number; count: number } | null {
  const card = column[cardIndex];
  if (!card?.faceUp) return null;
  return { fromIndex: cardIndex, count: column.length - cardIndex };
}
