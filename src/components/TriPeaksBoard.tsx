import { useMemo } from 'react';
import {
  getTriPeaksCard,
  getTriPeaksPlayTargets,
  isTriPeaksExposed,
  pickKey,
  wasteTop,
} from '../game/tripeaks/rules';
import { TRIPEAKS_ROW_SIZES, type TriPeaksState } from '../game/tripeaks/types';
import type { GameAction, TriPeaksPick } from '../game/variant';
import { CardView } from './CardView';

interface TriPeaksBoardProps {
  state: TriPeaksState;
  onDispatch: (action: GameAction) => void;
}

export function TriPeaksBoard({ state, onDispatch }: TriPeaksBoardProps) {
  const targetKeys = useMemo(
    () => new Set(getTriPeaksPlayTargets(state).map(pickKey)),
    [state],
  );

  const canRecycle = state.stock.length === 0 && state.waste.length > 0;
  const remaining = state.stock.length + state.waste.length;

  const handleStock = () => {
    if (state.stock.length > 0) {
      onDispatch({ kind: 'flip-stock' });
    } else if (canRecycle) {
      onDispatch({ kind: 'recycle-waste' });
    }
  };

  const handleCard = (row: number, col: number) => {
    const pick: TriPeaksPick = { zone: 'tripeaks', row, col };
    if (!targetKeys.has(pickKey(pick))) return;
    onDispatch({ kind: 'play-tripeaks-card', pick });
  };

  return (
    <div className="board board--tripeaks">
      <div className="board__top board__top--tripeaks">
        <div className="board__stock-waste">
          <button
            type="button"
            className={`pile pile--stock ${canRecycle ? 'pile--recycle' : ''}`}
            onClick={handleStock}
            disabled={state.stock.length === 0 && !canRecycle}
            aria-label={
              state.stock.length > 0
                ? `Draw from stock (${state.stock.length} left)`
                : canRecycle
                  ? 'Recycle waste to stock'
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
            className="pile pile--waste"
            onClick={handleStock}
            disabled={state.stock.length === 0 && !canRecycle}
            aria-label="Waste pile — tap stock to draw or recycle"
          >
            {wasteTop(state) ? (
              <CardView card={wasteTop(state)!} />
            ) : (
              <div className="pile__placeholder" />
            )}
          </button>
        </div>

        <p className="tripeaks-hint">
          {remaining > 0 ? `${remaining} cards in stock` : 'Stock empty'}
          {wasteTop(state) && targetKeys.size > 0
            ? ` — ${targetKeys.size} play${targetKeys.size === 1 ? '' : 's'} available`
            : wasteTop(state)
              ? ' — draw or find a match'
              : ' — draw from stock'}
        </p>
      </div>

      <div className="tripeaks" aria-label="TriPeaks tableau">
        {TRIPEAKS_ROW_SIZES.map((size, row) => (
          <div key={row} className="tripeaks__row">
            {Array.from({ length: size }, (_, col) => {
              const card = getTriPeaksCard(state, row, col);
              const exposed = card !== null && isTriPeaksExposed(state, row, col);
              const isTarget = targetKeys.has(pickKey({ zone: 'tripeaks', row, col }));

              if (!card) {
                return <div key={col} className="tripeaks__slot tripeaks__slot--empty" />;
              }

              return (
                <button
                  key={col}
                  type="button"
                  className={`tripeaks__card ${!exposed ? 'tripeaks__card--buried' : ''} ${isTarget ? 'tripeaks__card--target' : ''}`}
                  disabled={!isTarget}
                  onClick={() => handleCard(row, col)}
                  aria-label={`TriPeaks row ${row + 1} column ${col + 1}`}
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
