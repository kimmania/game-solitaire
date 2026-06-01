import { useCallback, useMemo } from 'react';
import { hasEmptyTableau, tableauSelectableRange } from '../game/spider/rules';
import { SPIDER_FOUNDATIONS } from '../game/spider/types';
import type { SpiderState } from '../game/spider/types';
import type { BoardProps } from './boardTypes';
import { pileKey } from './boardUtils';
import { CardView } from './CardView';
import type { PileRef } from '../game/variant';

export function SpiderBoard({
  state,
  selection,
  targets,
  onSelect,
  onClearSelection,
  onDispatch,
  onTryMoveTo,
}: BoardProps<SpiderState>) {
  const targetKeys = useMemo(() => new Set(targets.map(pileKey)), [targets]);
  const isTarget = useCallback((ref: PileRef) => targetKeys.has(pileKey(ref)), [targetKeys]);

  const isSelected = useCallback(
    (ref: PileRef, index: number) =>
      selection !== null &&
      pileKey(selection.from) === pileKey(ref) &&
      index >= selection.fromIndex,
    [selection],
  );

  const handleStock = () => {
    onClearSelection();
    onDispatch({ kind: 'deal-spider-row' });
  };

  const handlePileTap = (ref: PileRef) => {
    if (selection && isTarget(ref)) {
      onTryMoveTo(ref);
      return;
    }
    onClearSelection();
  };

  const handleTableauCard = (colIndex: number, cardIndex: number) => {
    const column = state.tableau[colIndex];
    const range = tableauSelectableRange(column, cardIndex);
    if (!range) return;

    const from: PileRef = { zone: 'tableau', index: colIndex };

    if (selection && pileKey(selection.from) === pileKey(from)) {
      const inSelection =
        cardIndex >= selection.fromIndex &&
        cardIndex < selection.fromIndex + selection.count;
      if (inSelection) {
        onClearSelection();
        return;
      }
      onSelect(from, range.fromIndex, range.count);
      return;
    }

    if (selection && pileKey(selection.from) !== pileKey(from)) {
      if (onTryMoveTo({ zone: 'tableau', index: colIndex })) return;
      return;
    }

    onSelect(from, range.fromIndex, range.count);
  };

  const canDeal =
    state.stock.length > 0 && !hasEmptyTableau(state);

  return (
    <div className="board board--spider">
      <div className="board__top board__top--spider">
        <button
          type="button"
          className={`pile pile--stock ${canDeal ? '' : 'pile--stock-disabled'}`}
          onClick={handleStock}
          disabled={!canDeal}
          aria-label={
            state.stock.length === 0
              ? 'Stock empty'
              : hasEmptyTableau(state)
                ? 'Fill empty columns before dealing'
                : `Deal row (${state.stock.length} cards left)`
          }
        >
          {state.stock.length > 0 ? (
            <>
              <div className="card card--back" />
              <span className="pile__badge">{state.stock.length}</span>
            </>
          ) : (
            <div className="pile__placeholder" />
          )}
        </button>

        <div className="spider-progress" aria-live="polite">
          <span className="spider-progress__label">Completed sequences</span>
          <span className="spider-progress__count">
            {state.foundations} / {SPIDER_FOUNDATIONS}
          </span>
        </div>
      </div>

      <div className="board__tableau board__tableau--10">
        {state.tableau.map((column, colIndex) => {
          const tableauRef: PileRef = { zone: 'tableau', index: colIndex };
          const columnIsTarget = isTarget(tableauRef);
          const topIndex = column.length - 1;

          return (
            <div
              key={colIndex}
              className={`tableau-column ${column.length === 0 ? 'tableau-column--empty' : ''} ${columnIsTarget ? 'tableau-column--target' : ''}`}
            >
              <button
                type="button"
                className={`pile pile--tableau-slot ${column.length === 0 && columnIsTarget ? 'pile--target' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePileTap(tableauRef);
                }}
                aria-label={`Column ${colIndex + 1}`}
              >
                {column.length === 0 && <div className="pile__placeholder" />}
              </button>
              <div className="tableau-column__stack">
                {column.map((card, cardIndex) => (
                  <button
                    key={cardIndex}
                    type="button"
                    className={`tableau-card ${isSelected({ zone: 'tableau', index: colIndex }, cardIndex) ? 'tableau-card--selected' : ''} ${columnIsTarget && cardIndex === topIndex ? 'tableau-card--target' : ''}`}
                    style={{ ['--stack-offset' as string]: `${cardIndex * 18}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTableauCard(colIndex, cardIndex);
                    }}
                  >
                    <CardView card={card} compact={!card.faceUp} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
