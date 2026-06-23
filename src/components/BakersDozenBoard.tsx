import { tableauTopSelectable } from '../game/bakersdozen/rules';
import type { BakersDozenState } from '../game/bakersdozen/types';
import type { BoardProps } from './boardTypes';
import { pileKey } from './boardUtils';
import { CardView } from './CardView';
import type { PileRef } from '../game/variant';
import { useBoardSelection } from '../hooks/useBoardSelection';

export function BakersDozenBoard({
  state,
  selection,
  targets,
  onSelect,
  onClearSelection,
  onTryMoveTo,
}: BoardProps<BakersDozenState>) {
  const { isTarget, isSelected } = useBoardSelection(selection, targets);


  const handlePileTap = (ref: PileRef) => {
    if (selection && isTarget(ref)) {
      onTryMoveTo(ref);
      return;
    }
    onClearSelection();
  };

  const handleTableauCard = (colIndex: number, cardIndex: number) => {
    const column = state.tableau[colIndex];
    if (!tableauTopSelectable(column, cardIndex)) return;

    const from: PileRef = { zone: 'tableau', index: colIndex };
    const fromIndex = cardIndex;

    if (
      selection &&
      pileKey(selection.from) === pileKey(from) &&
      selection.fromIndex === fromIndex
    ) {
      onClearSelection();
      return;
    }

    if (selection && pileKey(selection.from) !== pileKey(from)) {
      if (onTryMoveTo({ zone: 'tableau', index: colIndex })) return;
    }

    onSelect(from, fromIndex, 1);
  };

  return (
    <div className="board board--bakersdozen">
      <div className="board__tableau board__tableau--13">
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
              <div className="tableau-column__stack tableau-column__stack--spread">
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
