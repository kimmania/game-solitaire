import { createDeck, shuffle, type Card } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, PyramidPick } from '../variant';
import { PYRAMID_ROWS, type PyramidState } from './types';

export function cardPairValue(card: Card): number {
  return card.rank;
}

export function dealPyramid(seed?: number): PyramidState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const pyramid: (Card | null)[][] = [];
  let offset = 0;

  for (let row = 0; row < PYRAMID_ROWS; row++) {
    const rowCards: Card[] = [];
    for (let col = 0; col <= row; col++) {
      const card = deck[offset++];
      card.faceUp = true;
      rowCards.push(card);
    }
    pyramid.push(rowCards);
  }

  return {
    variantId: 'pyramid',
    pyramid,
    stock: deck.slice(offset).map((c) => ({ ...c, faceUp: false })),
    waste: [],
    hasRecycled: false,
    moves: 0,
  };
}

export function getPyramidCard(state: PyramidState, row: number, col: number): Card | null {
  return state.pyramid[row]?.[col] ?? null;
}

export function isPyramidExposed(state: PyramidState, row: number, col: number): boolean {
  const card = getPyramidCard(state, row, col);
  if (!card) return false;
  if (row === PYRAMID_ROWS - 1) return true;

  const belowLeft = getPyramidCard(state, row + 1, col);
  const belowRight = getPyramidCard(state, row + 1, col + 1);
  return belowLeft === null && belowRight === null;
}

export function wasteTop(state: PyramidState): Card | null {
  return state.waste[state.waste.length - 1] ?? null;
}

function getPickCard(state: PyramidState, pick: PyramidPick): Card | null {
  if (pick.zone === 'waste') return wasteTop(state);
  return getPyramidCard(state, pick.row, pick.col);
}

function isPickExposed(state: PyramidState, pick: PyramidPick): boolean {
  if (pick.zone === 'waste') return wasteTop(state) !== null;
  return isPyramidExposed(state, pick.row, pick.col);
}

export function picksAreValidRemoval(state: PyramidState, picks: PyramidPick[]): boolean {
  if (picks.length === 0) return false;

  const cards = picks.map((p) => getPickCard(state, p));
  if (cards.some((c) => !c)) return false;
  if (!picks.every((p) => isPickExposed(state, p))) return false;

  if (picks.length === 1) {
    return cards[0]!.rank === 13;
  }

  if (picks.length === 2) {
    return cardPairValue(cards[0]!) + cardPairValue(cards[1]!) === 13;
  }

  return false;
}

function clearPick(state: PyramidState, pick: PyramidPick): void {
  if (pick.zone === 'waste') {
    state.waste.pop();
    return;
  }
  state.pyramid[pick.row][pick.col] = null;
}

export function pyramidCardsRemaining(state: PyramidState): number {
  let n = 0;
  for (const row of state.pyramid) {
    for (const card of row) {
      if (card) n++;
    }
  }
  return n;
}

export function isPyramidWon(state: PyramidState): boolean {
  return (
    pyramidCardsRemaining(state) === 0 &&
    state.stock.length === 0 &&
    state.waste.length === 0
  );
}

export function canApplyPyramid(state: PyramidState, action: GameAction): boolean {
  if (state.variantId !== 'pyramid') return false;

  if (action.kind === 'flip-stock') {
    return state.stock.length > 0;
  }

  if (action.kind === 'recycle-waste') {
    return state.stock.length === 0 && state.waste.length > 0 && !state.hasRecycled;
  }

  if (action.kind === 'remove-pyramid-cards') {
    return picksAreValidRemoval(state, action.picks);
  }

  return false;
}

export function applyPyramid(state: PyramidState, action: GameAction): PyramidState {
  if (!canApplyPyramid(state, action)) return state;

  const next: PyramidState = {
    ...state,
    pyramid: state.pyramid.map((row) => [...row]),
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
    case 'remove-pyramid-cards': {
      for (const pick of action.picks) {
        clearPick(next, pick);
      }
      break;
    }
  }

  return next;
}

/** Picks that can pair with `selected` to sum to 13 (or a lone King). */
export function getPyramidPairTargets(
  state: PyramidState,
  selected: PyramidPick,
): PyramidPick[] {
  const selectedCard = getPickCard(state, selected);
  if (!selectedCard || !isPickExposed(state, selected)) return [];

  const targets: PyramidPick[] = [];

  if (selectedCard.rank === 13) return targets;

  const need = 13 - cardPairValue(selectedCard);

  for (let row = 0; row < PYRAMID_ROWS; row++) {
    for (let col = 0; col <= row; col++) {
      const pick: PyramidPick = { zone: 'pyramid', row, col };
      if (
        selected.zone === 'pyramid' &&
        pick.row === selected.row &&
        pick.col === selected.col
      ) {
        continue;
      }

      const card = getPyramidCard(state, row, col);
      if (!card || !isPyramidExposed(state, row, col)) continue;
      if (card.rank === 13 && need === 13) continue;
      if (cardPairValue(card) === need) targets.push(pick);
    }
  }

  const waste = wasteTop(state);
  if (waste && selected.zone !== 'waste') {
    if (waste.rank === 13 && need === 13) {
      /* no-op */
    } else if (cardPairValue(waste) === need) {
      targets.push({ zone: 'waste' });
    }
  }

  return targets;
}

export function pickKey(pick: PyramidPick): string {
  return pick.zone === 'waste' ? 'waste' : `p-${pick.row}-${pick.col}`;
}
