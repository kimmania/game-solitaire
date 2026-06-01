import { createDeck, shuffle, type Card, type Rank } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, TriPeaksPick } from '../variant';
import { TRIPEAKS_ROW_SIZES, type TriPeaksState } from './types';

export function ranksAreAdjacent(a: Rank, b: Rank): boolean {
  if (a === b) return false;
  if (Math.abs(a - b) === 1) return true;
  return (a === 1 && b === 13) || (a === 13 && b === 1);
}

export function dealTriPeaks(seed?: number): TriPeaksState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const rows: Card[][] = [];
  let offset = 0;

  for (const size of TRIPEAKS_ROW_SIZES) {
    const row: Card[] = [];
    for (let col = 0; col < size; col++) {
      const card = deck[offset++];
      card.faceUp = true;
      row.push(card);
    }
    rows.push(row);
  }

  return {
    variantId: 'tripeaks',
    rows,
    stock: deck.slice(offset).map((c) => ({ ...c, faceUp: false })),
    waste: [],
    moves: 0,
  };
}

export function getTriPeaksCard(
  state: TriPeaksState,
  row: number,
  col: number,
): Card | null {
  return state.rows[row]?.[col] ?? null;
}

/**
 * Column indices in the row below that block this card.
 * Row 0 (peaks): each card spans two below. Rows 1→2 (+3 cards): staggered +1 index.
 * Row 2→3 (+1 card): left/right edges have a single cover; interior has two.
 */
export function getTriPeaksCoverCols(row: number, col: number): number[] {
  if (row >= TRIPEAKS_ROW_SIZES.length - 1) return [];

  const currSize = TRIPEAKS_ROW_SIZES[row];
  const nextSize = TRIPEAKS_ROW_SIZES[row + 1];
  const delta = nextSize - currSize;

  if (row === 0) return [col * 2, col * 2 + 1];

  if (delta === 3) {
    return [col + 1, col + 2];
  }

  // delta === 1 (9-card row over 10-card base)
  if (col === 0) return [0];
  if (col === currSize - 1) return [currSize - 1, currSize];
  return [col, col + 1];
}

function isCoverSlotClear(state: TriPeaksState, row: number, coverCol: number): boolean {
  const nextSize = TRIPEAKS_ROW_SIZES[row + 1];
  if (coverCol < 0 || coverCol >= nextSize) return true;
  return getTriPeaksCard(state, row + 1, coverCol) === null;
}

export function isTriPeaksExposed(state: TriPeaksState, row: number, col: number): boolean {
  const card = getTriPeaksCard(state, row, col);
  if (!card) return false;

  const coverCols = getTriPeaksCoverCols(row, col);
  if (coverCols.length === 0) return true;

  return coverCols.every((coverCol) => isCoverSlotClear(state, row, coverCol));
}

export function wasteTop(state: TriPeaksState): Card | null {
  return state.waste[state.waste.length - 1] ?? null;
}

export function triPeaksCardsRemaining(state: TriPeaksState): number {
  let n = 0;
  for (const row of state.rows) {
    for (const card of row) {
      if (card) n++;
    }
  }
  return n;
}

export function isTriPeaksWon(state: TriPeaksState): boolean {
  return (
    triPeaksCardsRemaining(state) === 0 &&
    state.stock.length === 0 &&
    state.waste.length === 0
  );
}

export function canPlayTriPeaksPick(state: TriPeaksState, pick: TriPeaksPick): boolean {
  const waste = wasteTop(state);
  if (!waste) return false;

  const card = getTriPeaksCard(state, pick.row, pick.col);
  if (!card || !isTriPeaksExposed(state, pick.row, pick.col)) return false;
  return ranksAreAdjacent(card.rank, waste.rank);
}

export function getTriPeaksPlayTargets(state: TriPeaksState): TriPeaksPick[] {
  const waste = wasteTop(state);
  if (!waste) return [];

  const targets: TriPeaksPick[] = [];
  for (let row = 0; row < TRIPEAKS_ROW_SIZES.length; row++) {
    for (let col = 0; col < TRIPEAKS_ROW_SIZES[row]; col++) {
      const pick: TriPeaksPick = { zone: 'tripeaks', row, col };
      if (canPlayTriPeaksPick(state, pick)) targets.push(pick);
    }
  }
  return targets;
}

export function pickKey(pick: TriPeaksPick): string {
  return `t-${pick.row}-${pick.col}`;
}

export function canApplyTriPeaks(state: TriPeaksState, action: GameAction): boolean {
  if (state.variantId !== 'tripeaks') return false;

  if (action.kind === 'flip-stock') {
    return state.stock.length > 0;
  }

  if (action.kind === 'recycle-waste') {
    return state.stock.length === 0 && state.waste.length > 0;
  }

  if (action.kind === 'play-tripeaks-card') {
    return canPlayTriPeaksPick(state, action.pick);
  }

  return false;
}

export function applyTriPeaks(state: TriPeaksState, action: GameAction): TriPeaksState {
  if (!canApplyTriPeaks(state, action)) return state;

  const next: TriPeaksState = {
    ...state,
    rows: state.rows.map((row) => [...row]),
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
    case 'play-tripeaks-card': {
      const { row, col } = action.pick;
      const card = next.rows[row][col]!;
      next.rows[row][col] = null;
      card.faceUp = true;
      next.waste.push(card);
      break;
    }
  }

  return next;
}
