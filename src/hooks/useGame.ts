import { useCallback, useMemo, useState } from 'react';
import type { AnyGameState } from '../game/registry';
import { DEFAULT_VARIANT_ID, getVariant, type VariantId } from '../game/registry';
import { normalizeSpiderState } from '../game/spider/rules';
import { isSpiderVariantId } from '../game/spider/types';
import type { EasthavenState } from '../game/easthaven/types';
import type { PyramidState } from '../game/pyramid/types';
import type { SpiderState } from '../game/spider/types';
import type { GameAction, PileRef } from '../game/variant';

const STORAGE_KEY = 'solitaire-saves-v2';
const LEGACY_STORAGE_KEY = 'solitaire-save-v1';

type Saves = Partial<Record<VariantId, AnyGameState>>;

function loadSaves(): Saves {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Saves;

    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy) as { variantId: VariantId; state: AnyGameState };
      if (parsed.variantId === 'klondike' && parsed.state.variantId === 'klondike') {
        return { klondike: parsed.state };
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

function loadStateForVariant(variantId: VariantId): AnyGameState | null {
  const state = loadSaves()[variantId];
  if (!state || state.variantId !== variantId) return null;
  if (isSpiderVariantId(state.variantId)) {
    return normalizeSpiderState(state as SpiderState);
  }
  if (state.variantId === 'easthaven' && !('hasRecycled' in state)) {
    return { ...(state as EasthavenState), hasRecycled: false };
  }
  if (state.variantId === 'pyramid' && !('hasRecycled' in state)) {
    return { ...(state as PyramidState), hasRecycled: false };
  }
  return state;
}

function persistState(variantId: VariantId, state: AnyGameState) {
  const saves = loadSaves();
  saves[variantId] = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
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
    return loadStateForVariant(initialVariantId) ?? variant.createInitialState();
  });

  const [selection, setSelection] = useState<Selection | null>(null);

  const won = variant.isWon(state);

  const changeVariant = useCallback((id: VariantId) => {
    const nextVariant = getVariant(id);
    setVariantId(id);
    setState(loadStateForVariant(id) ?? nextVariant.createInitialState());
    setSelection(null);
  }, []);

  const dispatch = useCallback(
    (action: GameAction) => {
      let selectWaste: Selection | null = null;

      setState((prev) => {
        if (!variant.canApply(prev, action)) return prev;
        const next = variant.apply(prev, action);
        persistState(variantId, next);

        if (
          action.kind === 'flip-stock' &&
          (next.variantId === 'klondike' || next.variantId === 'easthaven') &&
          'waste' in next &&
          next.waste.length > 0
        ) {
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
      persistState(variantId, next);
    },
    [variant, variantId],
  );

  const select = useCallback((from: PileRef, fromIndex: number, count: number) => {
    setSelection({ from, fromIndex, count });
  }, []);

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
    changeVariant,
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
    autoFoundation,
  };
}
