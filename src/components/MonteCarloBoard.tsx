import { useMemo, useState } from 'react';
import {
  canApplyMonteCarlo,
  getMonteCarloPairTargets,
  getGridCard,
  gridCardsRemaining,
  hasAnyPair,
  pickKey,
} from '../game/montecarlo/rules';
import { MONTE_CARLO_COLS, MONTE_CARLO_ROWS, type MonteCarloState } from '../game/montecarlo/types';
import type { GameAction, MonteCarloPick } from '../game/variant';
import { CardView } from './CardView';

interface MonteCarloBoardProps {
  state: MonteCarloState;
  onDispatch: (action: GameAction) => void;
}

export function MonteCarloBoard({ state, onDispatch }: MonteCarloBoardProps) {
  const [selected, setSelected] = useState<MonteCarloPick | null>(null);

  const targetKeys = useMemo(() => {
    if (!selected) return new Set<string>();
    return new Set(getMonteCarloPairTargets(state, selected).map(pickKey));
  }, [state, selected]);

  const canRedeal =
    gridCardsRemaining(state) > 0 &&
    !hasAnyPair(state) &&
    canApplyMonteCarlo(state, { kind: 'redeal-monte-carlo' });

  const tryRemove = (picks: [MonteCarloPick, MonteCarloPick]) => {
    onDispatch({ kind: 'remove-monte-carlo-pair', picks });
    setSelected(null);
  };

  const handleCell = (row: number, col: number) => {
    const card = getGridCard(state, row, col);
    if (!card) return;

    const pick: MonteCarloPick = { zone: 'grid', row, col };

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

  const handleStock = () => {
    setSelected(null);
    if (canRedeal) {
      onDispatch({ kind: 'redeal-monte-carlo' });
    }
  };

  return (
    <div className="board board--montecarlo">
      <div className="board__top board__top--montecarlo">
        <button
          type="button"
          className={`pile pile--stock ${canRedeal ? 'pile--recycle' : ''}`}
          onClick={handleStock}
          disabled={!canRedeal}
          aria-label={
            canRedeal
              ? `Redeal grid (${state.stock.length} in stock)`
              : hasAnyPair(state)
                ? 'Remove all pairs before redealing'
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
        <p className="montecarlo-hint">
          {gridCardsRemaining(state)} on grid
          {selected ? ' — tap a matching neighbor' : ''}
          {canRedeal ? ' — tap stock to redeal' : ''}
        </p>
      </div>

      <div className="montecarlo-grid" aria-label="Monte Carlo grid">
        {Array.from({ length: MONTE_CARLO_ROWS }, (_, row) => (
          <div key={row} className="montecarlo-grid__row">
            {Array.from({ length: MONTE_CARLO_COLS }, (_, col) => {
              const card = getGridCard(state, row, col);
              const pick: MonteCarloPick = { zone: 'grid', row, col };
              const isSel = selected !== null && pickKey(selected) === pickKey(pick);
              const isTarget = targetKeys.has(pickKey(pick));

              if (!card) {
                return <div key={col} className="montecarlo-grid__slot" />;
              }

              return (
                <button
                  key={col}
                  type="button"
                  className={`montecarlo-grid__card ${isSel ? 'montecarlo-grid__card--selected' : ''} ${isTarget ? 'montecarlo-grid__card--target' : ''}`}
                  onClick={() => handleCell(row, col)}
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
