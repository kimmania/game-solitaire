import { createDeck, shuffle, suitColor, type Card, type Rank, type Suit } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, MoveCardsAction, PileRef } from '../variant';
import { FREECELL_COLUMNS, FREECELL_SLOTS, type FreeCellState } from './types';

function emptyFoundations(): Record<Suit, Card[]> {
  return { hearts: [], diamonds: [], clubs: [], spades: [] };
}

export function dealFreeCell(seed?: number): FreeCellState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const tableau: Card[][] = Array.from({ length: FREECELL_COLUMNS }, () => []);
  let offset = 0;

  for (let col = 0; col < FREECELL_COLUMNS; col++) {
    const count = col < 4 ? 7 : 6;
    for (let i = 0; i < count; i++) {
      const card = deck[offset++];
      card.faceUp = true;
      tableau[col].push(card);
    }
  }

  return {
    variantId: 'freecell',
    tableau,
    freeCells: Array.from({ length: FREECELL_SLOTS }, () => null),
    foundations: emptyFoundations(),
    moves: 0,
  };
}

function getPile(state: FreeCellState, ref: PileRef): Card[] {
  switch (ref.zone) {
    case 'freecell':
      return state.freeCells[ref.index] ? [state.freeCells[ref.index]!] : [];
    case 'foundation':
      if (!('suit' in ref)) return [];
      return state.foundations[ref.suit];
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
  return suitColor(card.suit) !== suitColor(dest.suit) && card.rank === dest.rank - 1;
}

function isValidTableauStack(cards: Card[]): boolean {
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
  return true;
}

function emptyFreeCells(state: FreeCellState): number {
  return state.freeCells.filter((c) => c === null).length;
}

function emptyTableauColumns(state: FreeCellState): number {
  return state.tableau.filter((col) => col.length === 0).length;
}

/** Max cards in a movable tableau stack (standard FreeCell formula). */
export function maxMovableStack(state: FreeCellState): number {
  const w = emptyFreeCells(state);
  const m = emptyTableauColumns(state);
  return (1 + w) * 2 ** m;
}

export function isFreeCellWon(state: FreeCellState): boolean {
  return Object.values(state.foundations).every((f) => f.length === 13);
}

/** Only the exposed (bottom) card of a column may move into a free cell. */
export function normalizeMoveToFreeCell(
  state: FreeCellState,
  action: MoveCardsAction,
): MoveCardsAction | null {
  if (action.to.zone !== 'freecell') return action;

  if (action.from.zone === 'freecell') {
    return action.count === 1 ? action : null;
  }

  if (action.from.zone !== 'tableau') return null;

  const column = state.tableau[action.from.index];
  if (column.length === 0) return null;

  return {
    ...action,
    fromIndex: column.length - 1,
    count: 1,
  };
}

/** Build a move into a free cell from the current selection (column top card or free-cell card). */
export function buildFreeCellDropAction(
  state: FreeCellState,
  selection: { from: PileRef; fromIndex: number; count: number },
  slotIndex: number,
): MoveCardsAction | null {
  const to: PileRef = { zone: 'freecell', index: slotIndex };
  if (state.freeCells[slotIndex] !== null) return null;

  if (selection.from.zone === 'freecell') {
    if (selection.from.index === slotIndex) return null;
    const action: MoveCardsAction = {
      kind: 'move-cards',
      from: selection.from,
      to,
      fromIndex: 0,
      count: 1,
    };
    return canApplyFreeCell(state, action) ? action : null;
  }

  if (selection.from.zone === 'tableau') {
    const column = state.tableau[selection.from.index];
    if (column.length === 0) return null;
    const action: MoveCardsAction = {
      kind: 'move-cards',
      from: { zone: 'tableau', index: selection.from.index },
      to,
      fromIndex: column.length - 1,
      count: 1,
    };
    return canApplyFreeCell(state, action) ? action : null;
  }

  return null;
}

export function canApplyFreeCell(state: FreeCellState, action: GameAction): boolean {
  if (state.variantId !== 'freecell') return false;
  if (action.kind !== 'move-cards') return false;

  const move =
    action.to.zone === 'freecell' ? normalizeMoveToFreeCell(state, action) : action;
  if (!move) return false;

  if (move.from.zone === move.to.zone) {
    if (move.from.zone === 'tableau') {
      const from = move.from as { zone: 'tableau'; index: number };
      const to = move.to as { zone: 'tableau'; index: number };
      if (from.index === to.index) return false;
    } else if (move.from.zone === 'freecell') {
      const from = move.from as { zone: 'freecell'; index: number };
      const to = move.to as { zone: 'freecell'; index: number };
      if (from.index === to.index) return false;
    } else return false;
  }

  const source = getPile(state, move.from);
  const slice = source.slice(move.fromIndex);
  if (slice.length !== move.count || slice.length === 0) return false;

  if (move.from.zone === 'freecell' && move.count !== 1) return false;
  if (move.from.zone === 'foundation') return false;

  if (move.from.zone === 'tableau' && move.to.zone !== 'freecell') {
    if (!isValidTableauStack(slice)) return false;
    if (slice.length > maxMovableStack(state)) return false;
  }

  const target = getPile(state, move.to);

  if (move.to.zone === 'freecell') {
    if (state.freeCells[move.to.index] !== null) return false;
    return slice[0].faceUp;
  }

  if (move.to.zone === 'foundation') {
    if (move.count !== 1) return false;
    const suit = (move.to as { zone: 'foundation'; suit: Suit }).suit;
    return slice[0].suit === suit && canPlaceOnFoundation(slice[0], target);
  }

  if (move.to.zone === 'tableau') {
    return canPlaceOnTableau(slice[0], target);
  }

  return false;
}

export function applyFreeCell(state: FreeCellState, action: GameAction): FreeCellState {
  if (action.kind !== 'move-cards' || !canApplyFreeCell(state, action)) return state;

  const move =
    action.to.zone === 'freecell' ? normalizeMoveToFreeCell(state, action) : action;
  if (!move) return state;

  const next: FreeCellState = {
    ...state,
    tableau: state.tableau.map((col) => [...col]),
    freeCells: [...state.freeCells],
    foundations: {
      hearts: [...state.foundations.hearts],
      diamonds: [...state.foundations.diamonds],
      clubs: [...state.foundations.clubs],
      spades: [...state.foundations.spades],
    },
    moves: state.moves + 1,
  };

  const source = getPile(next, move.from);
  const moving = source.splice(move.fromIndex, move.count);

  if (move.from.zone === 'freecell') {
    next.freeCells[(move.from as { zone: 'freecell'; index: number }).index] = null;
  }

  const targetRef = move.to;
  if (targetRef.zone === 'freecell') {
    next.freeCells[targetRef.index] = moving[0];
  } else {
    getPile(next, targetRef).push(...moving);
  }

  return next;
}

export function getFreeCellTargets(
  state: FreeCellState,
  from: PileRef,
  fromIndex: number,
  count: number,
): PileRef[] {
  const actionBase = { from, fromIndex, count, kind: 'move-cards' as const };
  const targets: PileRef[] = [];

  if (from.zone === 'tableau' || from.zone === 'freecell') {
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades'] as const) {
      const ref: PileRef = { zone: 'foundation', suit };
      if (canApplyFreeCell(state, { ...actionBase, to: ref })) targets.push(ref);
    }
  }

  for (let i = 0; i < FREECELL_SLOTS; i++) {
    const ref: PileRef = { zone: 'freecell', index: i };
    if (from.zone === 'freecell' && from.index === i) continue;
    const drop = buildFreeCellDropAction(state, { from, fromIndex, count }, i);
    if (drop) targets.push(ref);
  }

  for (let i = 0; i < FREECELL_COLUMNS; i++) {
    const ref: PileRef = { zone: 'tableau', index: i };
    if (from.zone === 'tableau' && from.index === i) continue;
    if (canApplyFreeCell(state, { ...actionBase, to: ref })) targets.push(ref);
  }

  return targets;
}

export function getFreeCellAutoFoundation(
  state: FreeCellState,
  from: PileRef,
  fromIndex: number,
): PileRef | null {
  const pile = getPile(state, from);
  if (fromIndex !== pile.length - 1) return null;
  const targets = getFreeCellTargets(state, from, fromIndex, 1).filter((t) => t.zone === 'foundation');
  return targets.length === 1 ? targets[0] : null;
}

export function tableauSelectableRange(
  column: Card[],
  cardIndex: number,
): { fromIndex: number; count: number } | null {
  const card = column[cardIndex];
  if (!card?.faceUp) return null;
  return { fromIndex: cardIndex, count: column.length - cardIndex };
}
