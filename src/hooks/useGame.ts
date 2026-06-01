import { useCallback, useMemo, useState } from 'react';
import type { AnyGameState } from '../game/registry';
import { DEFAULT_VARIANT_ID, getVariant, type VariantId } from '../game/registry';
import type { GameAction, PileRef } from '../game/variant';

const STORAGE_KEY = 'solitaire-save-v1';

interface SavedGame {
  variantId: VariantId;
  state: AnyGameState;
}

function loadSaved(): SavedGame | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedGame;
    if (parsed.variantId !== 'klondike' || parsed.state.variantId !== 'klondike') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function persist(variantId: VariantId, state: AnyGameState) {
  const payload: SavedGame = { variantId, state };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export interface Selection {
  from: PileRef;
  fromIndex: number;
  count: number;
}

export function useGame(initialVariantId: VariantId = DEFAULT_VARIANT_ID) {
  const [variantId, setVariantId] = useState<VariantId>(initialVariantId);
  const variant = useMemo(() => getVariant(variantId), [variantId]);

  const [state, setState] = useState<AnyGameState>(() => {
    const saved = loadSaved();
    if (saved && saved.variantId === initialVariantId) return saved.state;
    return variant.createInitialState();
  });

  const [selection, setSelection] = useState<Selection | null>(null);

  const won = variant.isWon(state);

  const dispatch = useCallback(
    (action: GameAction) => {
      let selectWaste: Selection | null = null;

      setState((prev) => {
        if (!variant.canApply(prev, action)) return prev;
        const next = variant.apply(prev, action);
        persist(variantId, next);

        if (action.kind === 'flip-stock' && next.variantId === 'klondike' && next.waste.length > 0) {
          selectWaste = {
            from: { zone: 'waste' },
            fromIndex: next.waste.length - 1,
            count: 1,
          };
        }

        return next;
      });

      setSelection(selectWaste);
    },
    [variant, variantId],
  );

  const newGame = useCallback(
    (seed?: number) => {
      const next = variant.createInitialState(seed);
      setState(next);
      setSelection(null);
      persist(variantId, next);
    },
    [variant, variantId],
  );

  const clearSave = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const select = useCallback(
    (from: PileRef, fromIndex: number, count: number) => {
      setSelection({ from, fromIndex, count });
    },
    [],
  );

  const clearSelection = useCallback(() => setSelection(null), []);

  const tryMoveTo = useCallback(
    (to: PileRef) => {
      if (!selection) return false;
      const action: GameAction = {
        kind: 'move-cards',
        from: selection.from,
        to,
        fromIndex: selection.fromIndex,
        count: selection.count,
      };
      if (!variant.canApply(state, action)) return false;
      dispatch(action);
      return true;
    },
    [selection, state, variant, dispatch],
  );

  const targets = useMemo(() => {
    if (!selection) return [];
    return variant.getTargetsForSelection(
      state,
      selection.from,
      selection.fromIndex,
      selection.count,
    );
  }, [selection, state, variant]);

  const autoFoundation = useCallback(
    (from: PileRef, fromIndex: number) => {
      const target = variant.getAutoFoundationTarget(state, from, fromIndex);
      if (!target) return;
      dispatch({
        kind: 'move-cards',
        from,
        to: target,
        fromIndex,
        count: 1,
      });
    },
    [state, variant, dispatch],
  );

  return {
    variantId,
    setVariantId,
    variant,
    state,
    won,
    moves: state.moves,
    selection,
    targets,
    select,
    clearSelection,
    tryMoveTo,
    dispatch,
    newGame,
    clearSave,
    autoFoundation,
  };
}
