import { describe, expect, it } from 'vitest';
import { applyFreeCell, canApplyFreeCell, dealFreeCell, isFreeCellWon, maxMovableStack } from './rules';

describe('freecell', () => {
  it('deals 52 cards face up across tableau', () => {
    const state = dealFreeCell(1);
    const total = state.tableau.reduce((n, col) => n + col.length, 0);
    expect(total).toBe(52);
    expect(state.freeCells.every((c) => c === null)).toBe(true);
  });

  it('allows the exposed column card into an empty free cell', () => {
    const state = dealFreeCell(2);
    const col = state.tableau.findIndex((c) => c.length > 0);
    if (col < 0) return;
    const topIndex = state.tableau[col].length - 1;
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: col },
      to: { zone: 'freecell' as const, index: 0 },
      fromIndex: topIndex,
      count: 1,
    };
    expect(canApplyFreeCell(state, action)).toBe(true);
    const next = applyFreeCell(state, action);
    expect(next.freeCells[0]).not.toBeNull();
  });

  it('moves column top card when stack selection does not end at top', () => {
    const state = dealFreeCell(5);
    const col = state.tableau.findIndex((c) => c.length >= 2);
    if (col < 0) return;
    const topIndex = state.tableau[col].length - 1;
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: col },
      to: { zone: 'freecell' as const, index: 1 },
      fromIndex: 0,
      count: 1,
    };
    if (topIndex === 0) return;
    const expectedRank = state.tableau[col][topIndex].rank;
    expect(canApplyFreeCell(state, action)).toBe(true);
    const next = applyFreeCell(state, action);
    expect(next.freeCells[1]?.rank).toBe(expectedRank);
  });

  it('moves between free cells', () => {
    const state = dealFreeCell(7);
    const col = state.tableau.findIndex((c) => c.length > 0);
    if (col < 0) return;
    let s = applyFreeCell(state, {
      kind: 'move-cards',
      from: { zone: 'tableau', index: col },
      to: { zone: 'freecell', index: 0 },
      fromIndex: state.tableau[col].length - 1,
      count: 1,
    });
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'freecell' as const, index: 0 },
      to: { zone: 'freecell' as const, index: 1 },
      fromIndex: 0,
      count: 1,
    };
    expect(canApplyFreeCell(s, action)).toBe(true);
    s = applyFreeCell(s, action);
    expect(s.freeCells[0]).toBeNull();
    expect(s.freeCells[1]).not.toBeNull();
  });

  it('uses the column top card even when selection starts lower in the column', () => {
    const state = dealFreeCell(6);
    const col = state.tableau.findIndex((c) => c.length >= 3);
    if (col < 0) return;
    const topIndex = state.tableau[col].length - 1;
    const topRank = state.tableau[col][topIndex].rank;
    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: col },
      to: { zone: 'freecell' as const, index: 2 },
      fromIndex: 0,
      count: 1,
    };
    const next = applyFreeCell(state, action);
    expect(next.freeCells[2]?.rank).toBe(topRank);
  });

  it('reports win when foundations are full', () => {
    const state = dealFreeCell(3);
    expect(isFreeCellWon(state)).toBe(false);
    const won = {
      ...state,
      foundations: {
        hearts: Array.from({ length: 13 }),
        diamonds: Array.from({ length: 13 }),
        clubs: Array.from({ length: 13 }),
        spades: Array.from({ length: 13 }),
      },
    } as ReturnType<typeof dealFreeCell>;
    expect(isFreeCellWon(won)).toBe(true);
  });

  it('computes movable stack limit from empty cells', () => {
    const state = dealFreeCell(4);
    expect(maxMovableStack(state)).toBeGreaterThanOrEqual(1);
  });
});
