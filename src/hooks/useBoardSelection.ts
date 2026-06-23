import { useCallback, useMemo } from 'react';
import type { Selection } from './useGame';
import type { PileRef } from '../game/variant';
import { pileKey } from '../components/boardUtils';

export function useBoardSelection(selection: Selection | null, targets: PileRef[]) {
  const targetKeys = useMemo(() => new Set(targets.map(pileKey)), [targets]);

  const isTarget = useCallback((ref: PileRef) => targetKeys.has(pileKey(ref)), [targetKeys]);

  const isSelected = useCallback(
    (ref: PileRef, index: number) =>
      selection !== null &&
      pileKey(selection.from) === pileKey(ref) &&
      index >= selection.fromIndex,
    [selection],
  );

  return { isTarget, isSelected };
}
