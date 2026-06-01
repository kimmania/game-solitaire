import { useCallback, useMemo } from 'react';
import { SUITS, rankLabel } from '../game/cards';
import {
  getCanfieldAutoFoundation,
  reserveTopSelectable,
  tableauSelectableRange,
  wasteTopSelectable,
} from '../game/canfield/rules';
import type { CanfieldState } from '../game/canfield/types';
import type { BoardProps } from './boardTypes';
import { pileKey } from './boardUtils';
import { CardView } from './CardView';
import type { PileRef } from '../game/variant';

export function CanfieldBoard({
  state,
  selection,
  targets,
  onSelect,
  onClearSelection,
  onDispatch,
  onTryMoveTo,
  onAutoFoundation,
}: BoardProps<CanfieldState>) {
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
    if (state.stock.length > 0) {
      onDispatch({ kind: 'flip-stock' });
    } else if (state.waste.length > 0) {
      onDispatch({ kind: 'recycle-waste' });
    }
  };

  const handleWaste = () => {
    if (!wasteTopSelectable(state)) return;
    const from: PileRef = { zone: 'waste' };
    const fromIndex = state.waste.length - 1;

    if (selection && pileKey(selection.from) === 'waste') {
      if (getCanfieldAutoFoundation(state, from, fromIndex)) {
        onAutoFoundation(from, fromIndex);
      } else {
        onClearSelection();
      }
      return;
    }

    if (selection) return;

    onSelect(from, fromIndex, 1);
  };

  const handleReserve = () => {
    if (!reserveTopSelectable(state)) return;
    const from: PileRef = { zone: 'reserve' };
    const fromIndex = state.reserve.length - 1;

    if (selection && pileKey(selection.from) === 'reserve') {
      if (getCanfieldAutoFoundation(state, from, fromIndex)) {
        onAutoFoundation(from, fromIndex);
      } else {
        onClearSelection();
      }
      return;
    }

    if (selection) return;

    onSelect(from, fromIndex, 1);
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

    if (
      selection &&
      pileKey(selection.from) === pileKey(from) &&
      cardIndex >= selection.fromIndex
    ) {
      if (getCanfieldAutoFoundation(state, from, range.fromIndex + range.count - 1)) {
        onAutoFoundation(from, range.fromIndex + range.count - 1);
      } else {
        onClearSelection();
      }
      return;
    }

    if (selection && pileKey(selection.from) !== pileKey(from)) {
      if (onTryMoveTo({ zone: 'tableau', index: colIndex })) return;
      return;
    }

    onSelect(from, range.fromIndex, range.count);
  };

  const reserveTop = state.reserve[state.reserve.length - 1];
  const baseLabel = rankLabel(state.baseRank);

  return (
    <div className="board board--canfield">
      <div className="board__top board__top--canfield">
        <div className="board__stock-waste">
          <button
            type="button"
            className={`pile pile--stock ${state.stock.length === 0 && state.waste.length > 0 ? 'pile--recycle' : ''}`}
            onClick={handleStock}
            aria-label="Draw from stock"
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

          <button
            type="button"
            className={`pile pile--waste ${isSelected({ zone: 'waste' }, state.waste.length - 1) ? 'pile--selected' : ''}`}
            onClick={handleWaste}
            aria-label="Waste pile"
          >
            {state.waste.length > 0 ? (
              <CardView card={state.waste[state.waste.length - 1]} />
            ) : (
              <div className="pile__placeholder" />
            )}
          </button>
        </div>

        <button
          type="button"
          className={`pile pile--reserve ${selection?.from.zone === 'reserve' ? 'pile--selected' : ''} ${isTarget({ zone: 'reserve' }) ? 'pile--target' : ''}`}
          onClick={handleReserve}
          aria-label={`Reserve pile, ${state.reserve.length} cards`}
        >
          {reserveTop ? (
            <>
              <CardView card={reserveTop} />
              <span className="pile__badge">{state.reserve.length}</span>
            </>
          ) : (
            <div className="pile__placeholder" />
          )}
        </button>

        <div className="board__foundations">
          {SUITS.map((suit) => {
            const pile = state.foundations[suit];
            const ref: PileRef = { zone: 'foundation', suit };
            const top = pile[pile.length - 1];
            return (
              <button
                key={suit}
                type="button"
                className={`pile pile--foundation ${isTarget(ref) ? 'pile--target' : ''}`}
                onClick={() => handlePileTap(ref)}
                aria-label={`${suit} foundation, base ${baseLabel}`}
              >
                {top ? (
                  <CardView card={top} />
                ) : (
                  <div className="pile__placeholder pile__placeholder--suit">
                    {baseLabel}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="board__tableau board__tableau--4">
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
                aria-label={`Tableau column ${colIndex + 1}`}
              >
                {column.length === 0 && <div className="pile__placeholder" />}
              </button>
              <div className="tableau-column__stack">
                {column.map((card, cardIndex) => (
                  <button
                    key={cardIndex}
                    type="button"
                    className={`tableau-card ${isSelected({ zone: 'tableau', index: colIndex }, cardIndex) ? 'tableau-card--selected' : ''} ${columnIsTarget && cardIndex === topIndex ? 'tableau-card--target' : ''}`}
                    style={{ ['--stack-offset' as string]: `${cardIndex * 22}px` }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTableauCard(colIndex, cardIndex);
                    }}
                  >
                    <CardView card={card} />
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
