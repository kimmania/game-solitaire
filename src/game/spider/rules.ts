import { createDoubleDeck, shuffle, type Card, type Rank } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PileRef } from '../variant';
import { SEQUENCE_LENGTH, SPIDER_COLUMNS, SPIDER_FOUNDATIONS, type SpiderState } from './types';

export function dealSpider(seed?: number): SpiderState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDoubleDeck(), random).map((c) => ({
    ...c,
    suit: 'spades' as const,
  }));

  const tableau: Card[][] = Array.from({ length: SPIDER_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < SPIDER_COLUMNS; col++) {
    const count = col < 4 ? 6 : 5;
    for (let row = 0; row < count; row++) {
      const card = deck[offset++];
      card.faceUp = row === count - 1;
      tableau[col].push(card);
    }
  }

  return {
    variantId: 'spider',
    tableau,
    stock: deck.slice(offset).map((c) => ({ ...c, faceUp: false })),
    foundations: 0,
    moves: 0,
  };
}

function getPile(state: SpiderState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'stock':
      return state.stock;
    case 'tableau':
      return state.tableau[ref.index];
    default:
      return [];
  }
}

function isValidSpiderStack(cards: Card[]): boolean {
  if (cards.length === 0) return false;
  if (!cards[0].faceUp) return false;
  for (let i = 1; i < cards.length; i++) {
    const prev = cards[i - 1];
    const curr = cards[i];
    if (!curr.faceUp) return false;
    if (prev.rank !== curr.rank + 1) return false;
  }
  return true;
}

function canPlaceOnTableau(card: Card, target: Card[]): boolean {
  if (!card.faceUp) return false;
  if (target.length === 0) return true;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return card.rank === dest.rank - 1;
}

function canMoveSpiderStack(cards: Card[], target: Card[]): boolean {
  if (!isValidSpiderStack(cards)) return false;
  return canPlaceOnTableau(cards[0], target);
}

function isCompleteSequence(cards: Card[]): boolean {
  if (cards.length !== SEQUENCE_LENGTH) return false;
  for (let i = 0; i < SEQUENCE_LENGTH; i++) {
    if (!cards[i].faceUp) return false;
    if (cards[i].rank !== (SEQUENCE_LENGTH - i) as Rank) return false;
  }
  return true;
}

function removeCompleteSequences(state: SpiderState): void {
  for (const col of state.tableau) {
    while (col.length >= SEQUENCE_LENGTH) {
      const start = col.length - SEQUENCE_LENGTH;
      const tail = col.slice(start);
      if (!isCompleteSequence(tail)) break;
      col.splice(start, SEQUENCE_LENGTH);
      state.foundations++;
      const flipped = col[col.length - 1];
      if (flipped && !flipped.faceUp) flipped.faceUp = true;
    }
  }
}

export function hasEmptyTableau(state: SpiderState): boolean {
  return state.tableau.some((col) => col.length === 0);
}

export function isSpiderWon(state: SpiderState): boolean {
  return state.foundations >= SPIDER_FOUNDATIONS;
}

export function canApplySpider(state: SpiderState, action: GameAction): boolean {
  if (state.variantId !== 'spider') return false;

  if (action.kind === 'deal-spider-row') {
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
  return canMoveSpiderStack(slice, target);
}

export function applySpider(state: SpiderState, action: GameAction): SpiderState {
  if (!canApplySpider(state, action)) return state;

  const next: SpiderState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    stock: [...state.stock],
    foundations: state.foundations,
    moves: state.moves + 1,
  };

  if (action.kind === 'deal-spider-row') {
    for (let col = 0; col < SPIDER_COLUMNS; col++) {
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

export function getSpiderTargets(
  state: SpiderState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  if (from.zone !== 'tableau') return [];

  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  for (let i = 0; i < SPIDER_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplySpider(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function tableauSelectableRange(
  column: Card[],
  cardIndex: number,
): { fromIndex: number; count: number } | null {
  const card = column[cardIndex];
  if (!card?.faceUp) return null;
  return { fromIndex: cardIndex, count: column.length - cardIndex };
}
