import { useMemo, useState } from 'react';
import {
  getPyramidCard,
  getPyramidPairTargets,
  isPyramidExposed,
  pickKey,
  wasteTop,
} from '../game/pyramid/rules';
import { PYRAMID_ROWS, type PyramidState } from '../game/pyramid/types';
import type { GameAction, PyramidPick } from '../game/variant';
import { CardView } from './CardView';

interface PyramidBoardProps {
  state: PyramidState;
  onDispatch: (action: GameAction) => void;
  onClearSelection?: () => void;
}

export function PyramidBoard({ state, onDispatch }: PyramidBoardProps) {
  const [selected, setSelected] = useState<PyramidPick | null>(null);

  const targetKeys = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(getPyramidPairTargets(state, selected).map(pickKey));
  }, [state, selected]);

  const canRecycle =
    state.stock.length === 0 && state.waste.length > 0 && !state.hasRecycled;

  const tryRemove = (picks: PyramidPick[]) => {
    onDispatch({ kind: 'remove-pyramid-cards', picks });
    setSelected(null);
  };

  const handleStock = () => {
    setSelected(null);
    if (state.stock.length > 0) {
      onDispatch({ kind: 'flip-stock' });
    } else if (canRecycle) {
      onDispatch({ kind: 'recycle-waste' });
    }
  };

  const handleWaste = () => {
    const card = wasteTop(state);
    if (!card) return;

    if (card.rank === 13) {
      tryRemove([{ zone: 'waste' }]);
      return;
    }

    const pick: PyramidPick = { zone: 'waste' };
    if (!selected) {
      setSelected(pick);
      return;
    }
    if (pickKey(selected) === 'waste') {
      setSelected(null);
      return;
    }
    tryRemove([selected, pick]);
  };

  const handlePyramidCard = (row: number, col: number) => {
    const card = getPyramidCard(state, row, col);
    if (!card || !isPyramidExposed(state, row, col)) return;

    const pick: PyramidPick = { zone: 'pyramid', row, col };

    if (card.rank === 13) {
      tryRemove([pick]);
      return;
    }

    if (!selected) {
      setSelected(pick);
      return;
    }

    if (pickKey(selected) === pickKey(pick)) {
      setSelected(null);
      return;
    }

    tryRemove([selected, pick]);
  };

  const remaining = state.stock.length + state.waste.length;

  return (
    <div className="board board--pyramid">
      <div className="board__top board__top--pyramid">
        <div className="board__stock-waste">
          <button
            type="button"
            className={`pile pile--stock ${canRecycle ? 'pile--recycle' : ''} ${state.hasRecycled && state.stock.length === 0 ? 'pile--stock-disabled' : ''}`}
            onClick={handleStock}
            disabled={state.stock.length === 0 && !canRecycle}
            aria-label={
              state.stock.length > 0
                ? `Draw from stock (${state.stock.length} left)`
                : canRecycle
                  ? 'Recycle waste (once)'
                  : 'Stock empty'
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
            className={`pile pile--waste ${selected?.zone === 'waste' ? 'pile--selected' : ''} ${targetKeys.has('waste') ? 'pile--target' : ''}`}
            onClick={handleWaste}
            aria-label="Waste pile"
          >
            {wasteTop(state) ? (
              <CardView card={wasteTop(state)!} />
            ) : (
              <div className="pile__placeholder" />
            )}
          </button>
        </div>

        <p className="pyramid-hint">
          {remaining > 0 ? `${remaining} cards in stock` : 'Stock empty'}
          {selected ? ' — tap a highlighted match' : ''}
        </p>
      </div>

      <div className="pyramid" aria-label="Pyramid tableau">
        {Array.from({ length: PYRAMID_ROWS }, (_, row) => (
          <div key={row} className="pyramid__row">
            {Array.from({ length: row + 1 }, (_, col) => {
              const card = getPyramidCard(state, row, col);
              const pick: PyramidPick = { zone: 'pyramid', row, col };
              const exposed = card !== null && isPyramidExposed(state, row, col);
              const isSel = selected !== null && pickKey(selected) === pickKey(pick);
              const isTarget = targetKeys.has(pickKey(pick));

              if (!card) {
                return <div key={col} className="pyramid__slot pyramid__slot--empty" />;
              }

              return (
                <button
                  key={col}
                  type="button"
                  className={`pyramid__card ${!exposed ? 'pyramid__card--buried' : ''} ${isSel ? 'pyramid__card--selected' : ''} ${isTarget ? 'pyramid__card--target' : ''}`}
                  disabled={!exposed}
                  onClick={() => handlePyramidCard(row, col)}
                  aria-label={`Pyramid card row ${row + 1}`}
                >
                  <CardView card={card} />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
