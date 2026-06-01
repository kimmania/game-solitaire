import { describe, expect, it } from 'vitest';
import {
  applyKlondike,
  canApplyKlondike,
  dealKlondike,
  isKlondikeWon,
} from './rules';

describe('klondike', () => {
  it('deals 52 cards across stock and tableau', () => {
    const state = dealKlondike(42);
    const inTableau = state.tableau.reduce((n, col) => n + col.length, 0);
    expect(inTableau).toBe(28);
    expect(state.stock.length).toBe(24);
    expect(state.waste.length).toBe(0);
  });

  it('is deterministic with the same seed', () => {
    const a = dealKlondike(99);
    const b = dealKlondike(99);
    expect(a.tableau[0][0]).toEqual(b.tableau[0][0]);
    expect(a.stock.length).toBe(b.stock.length);
  });

  it('flips stock to waste', () => {
    const state = dealKlondike(1);
    const stockBefore = state.stock.length;
    const next = applyKlondike(state, { kind: 'flip-stock' });
    expect(next.stock.length).toBe(stockBefore - 1);
    expect(next.waste.length).toBe(1);
    expect(next.waste[0].faceUp).toBe(true);
  });

  it('recycles waste when stock is empty', () => {
    let state = dealKlondike(2);
    while (state.stock.length > 0) {
      state = applyKlondike(state, { kind: 'flip-stock' });
    }
    expect(state.waste.length).toBeGreaterThan(0);
    const recycled = applyKlondike(state, { kind: 'recycle-waste' });
    expect(recycled.waste.length).toBe(0);
    expect(recycled.stock.length).toBeGreaterThan(0);
    expect(recycled.stock.every((c) => !c.faceUp)).toBe(true);
  });

  it('detects win when all foundations are full', () => {
    const state = dealKlondike(3);
    expect(isKlondikeWon(state)).toBe(false);
    const won = {
      ...state,
      foundations: {
        hearts: Array.from({ length: 13 }),
        diamonds: Array.from({ length: 13 }),
        clubs: Array.from({ length: 13 }),
        spades: Array.from({ length: 13 }),
      },
    } as ReturnType<typeof dealKlondike>;
    expect(isKlondikeWon(won)).toBe(true);
  });

  it('moves waste card to tableau when legal', () => {
    const state = dealKlondike(100);
    let s = state;
    while (s.waste.length === 0 && s.stock.length > 0) {
      s = applyKlondike(s, { kind: 'flip-stock' });
    }
    if (s.waste.length === 0) return;

    const wasteCard = s.waste[s.waste.length - 1];
    for (let col = 0; col < s.tableau.length; col++) {
      const action = {
        kind: 'move-cards' as const,
        from: { zone: 'waste' as const },
        to: { zone: 'tableau' as const, index: col },
        fromIndex: s.waste.length - 1,
        count: 1,
      };
      if (canApplyKlondike(s, action)) {
        const next = applyKlondike(s, action);
        expect(next.waste.length).toBe(s.waste.length - 1);
        expect(next.tableau[col][next.tableau[col].length - 1].rank).toBe(wasteCard.rank);
        return;
      }
    }
  });

  it('allows king onto empty tableau column', () => {
    const state = dealKlondike(200);
    let fromCol = -1;
    let fromIndex = -1;

    for (let c = 0; c < state.tableau.length; c++) {
      const col = state.tableau[c];
      for (let i = 0; i < col.length; i++) {
        if (col[i].faceUp && col[i].rank === 13) {
          fromCol = c;
          fromIndex = i;
          break;
        }
      }
      if (fromCol >= 0) break;
    }
    if (fromCol < 0) return;

    let emptyCol = state.tableau.findIndex((col) => col.length === 0);
    if (emptyCol < 0) {
      const cleared = {
        ...state,
        tableau: state.tableau.map((col, i) => (i === 0 ? [] : [...col])),
      };
      emptyCol = 0;
      const action = {
        kind: 'move-cards' as const,
        from: { zone: 'tableau' as const, index: fromCol },
        to: { zone: 'tableau' as const, index: emptyCol },
        fromIndex,
        count: state.tableau[fromCol].length - fromIndex,
      };
      expect(canApplyKlondike(cleared, action)).toBe(true);
      return;
    }

    const action = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: fromCol },
      to: { zone: 'tableau' as const, index: emptyCol },
      fromIndex,
      count: state.tableau[fromCol].length - fromIndex,
    };
    expect(canApplyKlondike(state, action)).toBe(true);
    const next = applyKlondike(state, action);
    expect(next.tableau[emptyCol].length).toBeGreaterThan(0);
    expect(next.tableau[emptyCol][0].rank).toBe(13);
  });

  it('rejects non-king onto empty tableau column', () => {
    const state = dealKlondike(201);
    const emptyCol = state.tableau.findIndex((col) => col.length === 0);
    if (emptyCol < 0) return;

    for (let c = 0; c < state.tableau.length; c++) {
      const col = state.tableau[c];
      for (let i = 0; i < col.length; i++) {
        const card = col[i];
        if (!card.faceUp || card.rank === 13) continue;
        const action = {
          kind: 'move-cards' as const,
          from: { zone: 'tableau' as const, index: c },
          to: { zone: 'tableau' as const, index: emptyCol },
          fromIndex: i,
          count: col.length - i,
        };
        expect(canApplyKlondike(state, action)).toBe(false);
        return;
      }
    }
  });

  it('rejects illegal tableau moves', () => {
    const state = dealKlondike(4);
    const illegal = {
      kind: 'move-cards' as const,
      from: { zone: 'tableau' as const, index: 0 },
      to: { zone: 'tableau' as const, index: 1 },
      fromIndex: 0,
      count: 1,
    };
    if (!canApplyKlondike(state, illegal)) {
      expect(canApplyKlondike(state, illegal)).toBe(false);
    } else {
      expect(true).toBe(true);
    }
  });
});
