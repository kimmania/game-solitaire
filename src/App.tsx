import { useState } from 'react';
import { GamePicker } from './components/GamePicker';
import { HelpDialog } from './components/HelpDialog';
import { VariantBoard } from './components/VariantBoard';
import { getHelpForVariant } from './game/help';
import { VARIANTS } from './game/registry';
import { useGame } from './hooks/useGame';

export default function App() {
  const [helpOpen, setHelpOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const {
    variantId,
    changeVariant,
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
  } = useGame();

  const help = getHelpForVariant(variantId);

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <h1 className="app__title">Solitaire</h1>
          <button
            type="button"
            className="app__variant-btn"
            onClick={() => setPickerOpen(true)}
            aria-haspopup="dialog"
          >
            {variant.meta.name} ▾
          </button>
        </div>
        <div className="app__stats">
          <span>Moves: {moves}</span>
          <div className="app__actions">
            <button type="button" className="btn btn--ghost" onClick={() => setPickerOpen(true)}>
              Games
            </button>
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
        <VariantBoard
          variantId={variantId}
          state={state}
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
          {VARIANTS.length} games available —{' '}
          <button type="button" className="link-btn" onClick={() => setPickerOpen(true)}>
            switch game
          </button>
          {' · '}
          <button type="button" className="link-btn" onClick={() => setHelpOpen(true)}>
            how to play
          </button>
        </p>
      </footer>

      <GamePicker
        open={pickerOpen}
        currentId={variantId}
        onSelect={changeVariant}
        onClose={() => setPickerOpen(false)}
      />

      <HelpDialog help={help} open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
