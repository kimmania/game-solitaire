import { createDeck, shuffle, type Card, type Rank } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PileRef } from '../variant';
import { BAKERS_COLUMNS, BAKERS_SEQUENCE_LENGTH, type BakersDozenState } from './types';

export function dealBakersDozen(seed?: number): BakersDozenState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const tableau: Card[][] = Array.from({ length: BAKERS_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < BAKERS_COLUMNS; col++) {
    for (let i = 0; i < 4; i++) {
      const card = deck[offset++];
      card.faceUp = true;
      tableau[col].push(card);
    }
    promoteKingsToBottom(tableau[col]);
  }

  return {
    variantId: 'bakersdozen',
    tableau,
    moves: 0,
  };
}

/** Kings sit at the bottom of each column (index 0) so they are never buried. */
export function promoteKingsToBottom(column: Card[]): void {
  const kings = column.filter((c) => c.rank === 13);
  const rest = column.filter((c) => c.rank !== 13);
  column.length = 0;
  column.push(...kings, ...rest);
}

function getPile(state: BakersDozenState, ref: PileRef): Card[] {
  if (ref.zone === 'tableau') return state.tableau[ref.index];
  return [];
}

function canPlaceOnTableau(card: Card, target: Card[]): boolean {
  if (!card.faceUp) return false;
  if (target.length === 0) return true;
  const dest = target[target.length - 1];
  if (!dest.faceUp) return false;
  return card.suit === dest.suit && card.rank === dest.rank - 1;
}

function isCompleteSequence(column: Card[]): boolean {
  if (column.length !== BAKERS_SEQUENCE_LENGTH) return false;
  const suit = column[0].suit;
  for (let i = 0; i < BAKERS_SEQUENCE_LENGTH; i++) {
    if (column[i].suit !== suit) return false;
    if (column[i].rank !== (BAKERS_SEQUENCE_LENGTH - i) as Rank) return false;
  }
  return true;
}

export function isBakersDozenWon(state: BakersDozenState): boolean {
  let complete = 0;
  for (const col of state.tableau) {
    if (col.length === 0) continue;
    if (isCompleteSequence(col)) complete++;
    else return false;
  }
  return complete === 4;
}

export function canApplyBakersDozen(state: BakersDozenState, action: GameAction): boolean {
  if (state.variantId !== 'bakersdozen') return false;
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
  if (action.fromIndex !== source.length - 1) return false;
  const card = source[action.fromIndex];
  if (!card?.faceUp) return false;

  const target = getPile(state, action.to);
  return canPlaceOnTableau(card, target);
}

export function applyBakersDozen(state: BakersDozenState, action: GameAction): BakersDozenState {
  if (!canApplyBakersDozen(state, action)) return state;

  const next: BakersDozenState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    moves: state.moves + 1,
  };

  if (action.kind !== 'move-cards') return state;

  const source = getPile(next, action.from);
  const moving = source.splice(action.fromIndex, action.count);
  getPile(next, action.to).push(...moving);

  return next;
}

export function getBakersDozenTargets(
  state: BakersDozenState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  if (from.zone !== 'tableau') return [];

  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  for (let i = 0; i < BAKERS_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.index === i) continue;
    if (canApplyBakersDozen(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getBakersDozenAutoFoundation(): null {
  return null;
}

export function tableauTopSelectable(column: Card[], cardIndex: number): boolean {
  return cardIndex === column.length - 1 && Boolean(column[cardIndex]?.faceUp);
}
