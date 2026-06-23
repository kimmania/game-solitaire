import { SUITS } from '../game/cards';
import {
  buildFreeCellDropAction,
  getFreeCellAutoFoundation,
  tableauSelectableRange,
} from '../game/freecell/rules';
import { FREECELL_SLOTS } from '../game/freecell/types';
import type { FreeCellState } from '../game/freecell/types';
import type { BoardProps } from './boardTypes';
import { pileKey } from './boardUtils';
import { CardView } from './CardView';
import type { PileRef } from '../game/variant';
import { useBoardSelection } from '../hooks/useBoardSelection';

export function FreeCellBoard({
  state,
  selection,
  targets,
  onSelect,
  onClearSelection,
  onDispatch,
  onTryMoveTo,
  onAutoFoundation,
}: BoardProps<FreeCellState>) {
  const { isTarget, isSelected } = useBoardSelection(selection, targets);


  const handlePileTap = (ref: PileRef) => {
    if (selection && isTarget(ref)) {
      onTryMoveTo(ref);
      return;
    }
    onClearSelection();
  };

  const handleFreeCell = (slotIndex: number) => {
    const ref: PileRef = { zone: 'freecell', index: slotIndex };
    const card = state.freeCells[slotIndex];

    if (card && selection && pileKey(selection.from) === pileKey(ref)) {
      if (getFreeCellAutoFoundation(state, ref, 0)) {
        onAutoFoundation(ref, 0);
      } else {
        onClearSelection();
      }
      return;
    }

    if (selection) {
      const drop = buildFreeCellDropAction(state, selection, slotIndex);
      if (drop) {
        onDispatch(drop);
        return;
      }
      return;
    }

    if (card) {
      onSelect(ref, 0, 1);
    }
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
      if (getFreeCellAutoFoundation(state, from, range.fromIndex + range.count - 1)) {
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

  return (
    <div className="board board--freecell">
      <div className="board__top board__top--freecell">
        <div className="board__freecells" aria-label="Free cells">
          {Array.from({ length: FREECELL_SLOTS }, (_, i) => {
            const ref: PileRef = { zone: 'freecell', index: i };
            const card = state.freeCells[i];
            const selected = card && isSelected(ref, 0);
            return (
              <button
                key={i}
                type="button"
                className={`pile pile--freecell ${selected ? 'pile--selected' : ''} ${isTarget(ref) ? 'pile--target' : ''}`}
                onClick={() => handleFreeCell(i)}
                aria-label={`Free cell ${i + 1}`}
              >
                {card ? <CardView card={card} /> : <div className="pile__placeholder" />}
              </button>
            );
          })}
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
                onClick={() => handlePileTap(ref)}
                aria-label={`${suit} foundation`}
              >
                {top ? (
                  <CardView card={top} />
                ) : (
                  <div className="pile__placeholder pile__placeholder--suit">
                    {suit[0].toUpperCase()}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="board__tableau board__tableau--8">
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
