import { createDeck, shuffle, type Card } from '../cards';
import { mulberry32 } from '../random';
import type { GameAction, MonteCarloPick } from '../variant';
import {
  MONTE_CARLO_COLS,
  MONTE_CARLO_GRID_SIZE,
  MONTE_CARLO_ROWS,
  type MonteCarloState,
} from './types';

export function dealMonteCarlo(seed?: number): MonteCarloState {
  const random = seed !== undefined ? mulberry32(seed) : Math.random;
  const deck = shuffle(createDeck(), random);

  const grid = dealGridFromStock(deck);
  return {
    variantId: 'montecarlo',
    grid,
    stock: deck,
    moves: 0,
  };
}

function dealGridFromStock(stock: Card[]): (Card | null)[][] {
  const next: (Card | null)[][] = Array.from({ length: MONTE_CARLO_ROWS }, () =>
    Array.from({ length: MONTE_CARLO_COLS }, () => null),
  );

  let placed = 0;
  for (let row = 0; row < MONTE_CARLO_ROWS && placed < MONTE_CARLO_GRID_SIZE; row++) {
    for (let col = 0; col < MONTE_CARLO_COLS && placed < MONTE_CARLO_GRID_SIZE; col++) {
      if (stock.length === 0) break;
      const card = stock.pop()!;
      card.faceUp = true;
      next[row][col] = card;
      placed++;
    }
  }

  return next;
}

export function getGridCard(
  state: MonteCarloState,
  row: number,
  col: number,
): Card | null {
  return state.grid[row]?.[col] ?? null;
}

export function pickKey(pick: MonteCarloPick): string {
  return `g-${pick.row}-${pick.col}`;
}

function areAdjacent(a: MonteCarloPick, b: MonteCarloPick): boolean {
  const dr = Math.abs(a.row - b.row);
  const dc = Math.abs(a.col - b.col);
  return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
}

export function picksAreValidPair(
  state: MonteCarloState,
  picks: [MonteCarloPick, MonteCarloPick],
): boolean {
  const [a, b] = picks;
  if (a.row === b.row && a.col === b.col) return false;

  const cardA = getGridCard(state, a.row, a.col);
  const cardB = getGridCard(state, b.row, b.col);
  if (!cardA || !cardB) return false;
  if (cardA.rank !== cardB.rank) return false;
  return areAdjacent(a, b);
}

export function gridCardsRemaining(state: MonteCarloState): number {
  let n = 0;
  for (const row of state.grid) {
    for (const card of row) {
      if (card) n++;
    }
  }
  return n;
}

export function hasAnyPair(state: MonteCarloState): boolean {
  for (let row = 0; row < MONTE_CARLO_ROWS; row++) {
    for (let col = 0; col < MONTE_CARLO_COLS; col++) {
      const pick: MonteCarloPick = { zone: 'grid', row, col };
      if (getMonteCarloPairTargets(state, pick).length > 0) return true;
    }
  }
  return false;
}

export function getMonteCarloPairTargets(
  state: MonteCarloState,
  selected: MonteCarloPick,
): MonteCarloPick[] {
  const card = getGridCard(state, selected.row, selected.col);
  if (!card) return [];

  const targets: MonteCarloPick[] = [];
  const deltas = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];

  for (const [dr, dc] of deltas) {
    const row = selected.row + dr;
    const col = selected.col + dc;
    const pick: MonteCarloPick = { zone: 'grid', row, col };
    if (picksAreValidPair(state, [selected, pick])) targets.push(pick);
  }

  return targets;
}

export function isMonteCarloWon(state: MonteCarloState): boolean {
  return gridCardsRemaining(state) === 0 && state.stock.length === 0;
}

export function canApplyMonteCarlo(state: MonteCarloState, action: GameAction): boolean {
  if (state.variantId !== 'montecarlo') return false;

  if (action.kind === 'remove-monte-carlo-pair') {
    return picksAreValidPair(state, action.picks);
  }

  if (action.kind === 'redeal-monte-carlo') {
    return gridCardsRemaining(state) > 0 && !hasAnyPair(state) && state.stock.length > 0;
  }

  return false;
}

export function applyMonteCarlo(state: MonteCarloState, action: GameAction): MonteCarloState {
  if (!canApplyMonteCarlo(state, action)) return state;

  const next: MonteCarloState = {
    ...state,
    grid: state.grid.map((row) => [...row]),
    stock: [...state.stock],
    moves: state.moves + 1,
  };

  if (action.kind === 'remove-monte-carlo-pair') {
    for (const pick of action.picks) {
      next.grid[pick.row][pick.col] = null;
    }
    return next;
  }

  if (action.kind === 'redeal-monte-carlo') {
    for (const row of next.grid) {
      for (let col = 0; col < row.length; col++) {
        const card = row[col];
        if (card) {
          card.faceUp = false;
          next.stock.unshift(card);
          row[col] = null;
        }
      }
    }
    next.grid = dealGridFromStock(next.stock);
    return next;
  }

  return next;
}
