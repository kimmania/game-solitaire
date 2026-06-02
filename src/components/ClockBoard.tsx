import { CLOCK_CENTER_INDEX, type ClockState } from '../game/clock/types';
import type { GameAction } from '../game/variant';
import { CardView } from './CardView';

interface ClockBoardProps {
  state: ClockState;
  onDispatch: (action: GameAction) => void;
}

const HOUR_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export function ClockBoard({ state, onDispatch }: ClockBoardProps) {
  const canFlip = !state.lost && state.piles[state.activePile].some((c) => !c.faceUp);

  const handleFlip = () => {
    if (canFlip) onDispatch({ kind: 'flip-clock' });
  };

  const renderPile = (pileIndex: number, label: string, isActive: boolean) => {
    const pile = state.piles[pileIndex];
    const top = pile[pile.length - 1];
    const faceDown = pile.filter((c) => !c.faceUp).length;

    return (
      <button
        key={pileIndex}
        type="button"
        className={`clock-pile ${isActive ? 'clock-pile--active' : ''}`}
        onClick={isActive ? handleFlip : undefined}
        disabled={!isActive || !canFlip}
        aria-label={`${label}, ${faceDown} face down`}
      >
        <span className="clock-pile__label">{label}</span>
        {top ? (
          <CardView card={top} compact={!top.faceUp} />
        ) : (
          <div className="pile__placeholder" />
        )}
        {faceDown > 0 ? <span className="clock-pile__count">{faceDown}</span> : null}
      </button>
    );
  };

  return (
    <div className="board board--clock">
      {state.lost ? (
        <p className="clock-banner clock-banner--lose" role="status">
          Fourth king reached the center — game over.
        </p>
      ) : null}

      <div className="clock-dial" aria-label="Clock tableau">
        <div className="clock-dial__hours">
          {HOUR_LABELS.map((label, hour) =>
            renderPile(hour, label, state.activePile === hour),
          )}
        </div>
        <div className="clock-dial__center">
          {renderPile(
            CLOCK_CENTER_INDEX,
            'K',
            state.activePile === CLOCK_CENTER_INDEX,
          )}
        </div>
      </div>

      <p className="clock-hint">
        {state.lost
          ? 'Start a new game to try again.'
          : canFlip
            ? `Tap the highlighted pile to turn the next card (${state.kingsToCenter}/4 kings in center).`
            : 'All cards revealed.'}
      </p>
    </div>
  );
}
