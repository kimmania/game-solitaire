import { SUITS } from '../game/cards';
import {
  getBeleagueredCastleAutoFoundation,
  tableauTopSelectable,
} from '../game/beleagueredcastle/rules';
import { BELEAGUERED_RESERVES, type BeleagueredCastleState } from '../game/beleagueredcastle/types';
import type { BoardProps } from './boardTypes';
import { pileKey } from './boardUtils';
import { CardView } from './CardView';
import type { PileRef } from '../game/variant';
import { useBoardSelection } from '../hooks/useBoardSelection';

export function BeleagueredCastleBoard({
  state,
  selection,
  targets,
  onSelect,
  onClearSelection,
  onTryMoveTo,
  onAutoFoundation,
}: BoardProps<BeleagueredCastleState>) {
  const { isTarget, isSelected } = useBoardSelection(selection, targets);


  const handlePileTap = (ref: PileRef) => {
    if (selection && isTarget(ref)) {
      onTryMoveTo(ref);
      return;
    }
    onClearSelection();
  };

  const handleReserve = (index: number) => {
    const ref: PileRef = { zone: 'reserve', index };
    const card = state.reserves[index];
    if (!card) return;

    if (selection && pileKey(selection.from) === pileKey(ref)) {
      if (getBeleagueredCastleAutoFoundation(state, ref, 0)) {
        onAutoFoundation(ref, 0);
      } else {
        onClearSelection();
      }
      return;
    }

    if (selection) return;

    onSelect(ref, 0, 1);
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
      if (getBeleagueredCastleAutoFoundation(state, from, fromIndex)) {
        onAutoFoundation(from, fromIndex);
      } else {
        onClearSelection();
      }
      return;
    }

    if (selection && pileKey(selection.from) !== pileKey(from)) {
      if (onTryMoveTo({ zone: 'tableau', index: colIndex })) return;
    }

    onSelect(from, fromIndex, 1);
  };

  return (
    <div className="board board--beleagueredcastle">
      <div className="board__top board__top--beleagueredcastle">
        <div className="board__reserves" aria-label="King reserves">
          {Array.from({ length: BELEAGUERED_RESERVES }, (_, i) => {
            const ref: PileRef = { zone: 'reserve', index: i };
            const card = state.reserves[i];
            return (
              <button
                key={i}
                type="button"
                className={`pile pile--reserve ${card && isSelected(ref, 0) ? 'pile--selected' : ''} ${isTarget(ref) ? 'pile--target' : ''}`}
                onClick={() => handleReserve(i)}
                aria-label={`Reserve ${i + 1}`}
              >
                {card ? (
                  <CardView card={card} />
                ) : (
                  <div className="pile__placeholder" />
                )}
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
