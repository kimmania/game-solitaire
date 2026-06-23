import { suitSymbol } from '../game/cards';
import {
  foundationSuitForIndex,
  getFortyThievesAutoFoundation,
  tableauTopSelectable,
  wasteTopSelectable,
} from '../game/fortythieves/rules';
import { FORTY_THIEVES_FOUNDATIONS, type FortyThievesState } from '../game/fortythieves/types';
import type { BoardProps } from './boardTypes';
import { pileKey } from './boardUtils';
import { CardView } from './CardView';
import type { PileRef } from '../game/variant';
import { useBoardSelection } from '../hooks/useBoardSelection';

export function FortyThievesBoard({
  state,
  selection,
  targets,
  onSelect,
  onClearSelection,
  onDispatch,
  onTryMoveTo,
  onAutoFoundation,
}: BoardProps<FortyThievesState>) {
  const { isTarget, isSelected } = useBoardSelection(selection, targets);


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
      if (getFortyThievesAutoFoundation(state, from, fromIndex)) {
        onAutoFoundation(from, fromIndex);
      }
      onClearSelection();
      return;
    }

    if (selection) return;

    onSelect(from, fromIndex, 1);
  };

  const handleTableauCard = (colIndex: number, cardIndex: number) => {
    const column = state.tableau[colIndex];
    if (!tableauTopSelectable(column, cardIndex)) return;

    const from: PileRef = { zone: 'tableau', index: colIndex };
    const fromIndex = cardIndex;

    if (selection && pileKey(selection.from) === pileKey(from) && selection.fromIndex === fromIndex) {
      if (getFortyThievesAutoFoundation(state, from, fromIndex)) {
        onAutoFoundation(from, fromIndex);
      }
      onClearSelection();
      return;
    }

    if (selection && pileKey(selection.from) !== pileKey(from)) {
      const target: PileRef = { zone: 'tableau', index: colIndex };
      if (onTryMoveTo(target)) return;
    }

    onSelect(from, fromIndex, 1);
  };

  return (
    <div className="board board--fortythieves">
      <div className="board__top board__top--fortythieves">
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
            className={`pile pile--waste ${isSelected({ zone: 'waste' }, Math.max(0, state.waste.length - 1)) ? 'pile--selected' : ''}`}
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

        <div className="board__foundations board__foundations--8">
          {Array.from({ length: FORTY_THIEVES_FOUNDATIONS }, (_, index) => {
            const pile = state.foundations[index];
            const ref: PileRef = { zone: 'foundation', index };
            const top = pile[pile.length - 1];
            const suit = foundationSuitForIndex(index);
            return (
              <button
                key={index}
                type="button"
                className={`pile pile--foundation ${isTarget(ref) ? 'pile--target' : ''}`}
                onClick={() => handlePileTap(ref)}
                aria-label={`${suit} foundation ${(index % 2) + 1}`}
              >
                {top ? (
                  <CardView card={top} />
                ) : (
                  <div className="pile__placeholder pile__placeholder--suit">
                    {suitSymbol(suit)}
                  </div>
                )}
              </button>
            );
          })}
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
                aria-label={
                  column.length === 0
                    ? `Empty tableau column ${colIndex + 1}`
                    : `Tableau column ${colIndex + 1}`
                }
              >
                {column.length === 0 && <div className="pile__placeholder" />}
              </button>
              <div className="tableau-column__stack tableau-column__stack--spread">
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
