import { useCallback, useMemo } from 'react';
import { SUITS } from '../game/cards';
import {
  tableauSelectableRange,
  wasteTopSelectable,
} from '../game/klondike/rules';
import type { KlondikeState } from '../game/klondike/types';
import type { Selection } from '../hooks/useGame';
import type { GameAction, PileRef } from '../game/variant';
import { getKlondikeAutoFoundation } from '../game/klondike/rules';
import { CardView } from './CardView';

function pileKey(ref: PileRef): string {
  if (ref.zone === 'foundation') return `f-${ref.suit}`;
  if (ref.zone === 'tableau') return `t-${ref.index}`;
  return ref.zone;
}

interface GameBoardProps {
  state: KlondikeState;
  selection: Selection | null;
  targets: PileRef[];
  onSelect: (from: PileRef, fromIndex: number, count: number) => void;
  onClearSelection: () => void;
  onDispatch: (action: GameAction) => void;
  onTryMoveTo: (to: PileRef) => boolean;
  onAutoFoundation: (from: PileRef, fromIndex: number) => void;
}

export function GameBoard({
  state,
  selection,
  targets,
  onSelect,
  onClearSelection,
  onDispatch,
  onTryMoveTo,
  onAutoFoundation,
}: GameBoardProps) {
  const targetKeys = useMemo(() => new Set(targets.map(pileKey)), [targets]);

  const isTarget = useCallback((ref: PileRef) => targetKeys.has(pileKey(ref)), [targetKeys]);

  const isSelected = useCallback(
    (ref: PileRef, index: number) =>
      selection !== null &&
      pileKey(selection.from) === pileKey(ref) &&
      index >= selection.fromIndex,
    [selection],
  );

  const handlePileTap = (ref: PileRef) => {
    if (selection && isTarget(ref)) {
      onTryMoveTo(ref);
      return;
    }
    onClearSelection();
  };

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
      if (getKlondikeAutoFoundation(state, from, fromIndex)) {
        onAutoFoundation(from, fromIndex);
      }
      return;
    }

    if (selection) return;

    onSelect(from, fromIndex, 1);
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
      onAutoFoundation(from, range.fromIndex + range.count - 1);
      onClearSelection();
      return;
    }

    if (selection && pileKey(selection.from) !== pileKey(from)) {
      const target: PileRef = { zone: 'tableau', index: colIndex };
      if (onTryMoveTo(target)) return;
      return;
    }

    onSelect(from, range.fromIndex, range.count);
  };

  const handleFoundationTap = (suit: (typeof SUITS)[number]) => {
    const ref: PileRef = { zone: 'foundation', suit };
    handlePileTap(ref);
  };

  return (
    <div className="board">
      <div className="board__top">
        <div className="board__stock-waste">
          <button
            type="button"
            className={`pile pile--stock ${state.stock.length === 0 && state.waste.length > 0 ? 'pile--recycle' : ''}`}
            onClick={handleStock}
            aria-label={
              state.stock.length > 0
                ? 'Draw card from stock'
                : state.waste.length > 0
                  ? 'Recycle waste to stock'
                  : 'Empty stock'
            }
          >
            {state.stock.length > 0 ? (
              <div className="card card--back" />
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
                onClick={() => handleFoundationTap(suit)}
                aria-label={`${suit} foundation`}
              >
                {top ? (
                  <CardView card={top} />
                ) : (
                  <div className="pile__placeholder pile__placeholder--suit">{suit[0].toUpperCase()}</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="board__tableau">
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
              className={`pile pile--tableau-slot ${column.length === 0 && columnIsTarget ? 'pile--target' : ''} ${column.length === 0 ? 'pile--tableau-slot-empty' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handlePileTap(tableauRef);
              }}
              aria-label={
                column.length === 0
                  ? `Empty tableau column ${colIndex + 1}${columnIsTarget ? ', drop here' : ''}`
                  : `Tableau column ${colIndex + 1}`
              }
            >
              {column.length === 0 && <div className="pile__placeholder" />}
            </button>
            <div className="tableau-column__stack">
              {column.map((card, cardIndex) => (
                <button
                  key={cardIndex}
                  type="button"
                  className={`tableau-card ${isSelected({ zone: 'tableau', index: colIndex }, cardIndex) ? 'tableau-card--selected' : ''} ${columnIsTarget && cardIndex === topIndex ? 'tableau-card--target' : ''}`}
                  style={{ ['--stack-offset' as string]: `${cardIndex * 28}px` }}
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
