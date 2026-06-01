import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { HelpDialog } from './components/HelpDialog';
import { getHelpForVariant } from './game/help';
import { DEFAULT_VARIANT_ID, VARIANTS } from './game/registry';
import type { KlondikeState } from './game/klondike/types';
import { useGame } from './hooks/useGame';

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false);
  const {
    variant,
    state,
    won,
    moves,
    selection,
    targets,
    select,
    clearSelection,
    tryMoveTo,
    dispatch,
    newGame,
    autoFoundation,
  } = useGame(DEFAULT_VARIANT_ID);

  const klondikeState = state as KlondikeState;
  const help = getHelpForVariant(variant.meta.id);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Solitaire</h1>
          <p className="app__variant">{variant.meta.name}</p>
        </div>
        <div className="app__stats">
          <span>Moves: {moves}</span>
          <div className="app__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setHelpOpen(true)}>
              Help
            </button>
            <button type="button" className="btn" onClick={() => newGame()}>
              New game
            </button>
          </div>
        </div>
      </header>

      {won && (
        <div className="banner banner--win" role="status">
          You win!{' '}
          <button type="button" className="btn btn--inline" onClick={() => newGame()}>
            Play again
          </button>
        </div>
      )}

      <main className="app__main">
        <GameBoard
          state={klondikeState}
          selection={selection}
          targets={targets}
          onSelect={select}
          onClearSelection={clearSelection}
          onDispatch={dispatch}
          onTryMoveTo={tryMoveTo}
          onAutoFoundation={autoFoundation}
        />
      </main>

      <footer className="app__footer">
        <p>
          New to the game?{' '}
          <button type="button" className="link-btn" onClick={() => setHelpOpen(true)}>
            Read how to play
          </button>
        </p>
        {VARIANTS.length > 1 ? null : (
          <p className="app__footer-note">More game styles coming in a future update.</p>
        )}
      </footer>

      <HelpDialog help={help} open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
