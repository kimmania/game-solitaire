import { VARIANTS, type VariantId } from '../game/registry';

interface GamePickerProps {
  open: boolean;
  currentId: VariantId;
  onSelect: (id: VariantId) => void;
  onClose: () => void;
}

export function GamePicker({ open, currentId, onSelect, onClose }: GamePickerProps) {
  if (!open) return null;

  return (
    <div className="help-backdrop" onClick={onClose}>
      <div
        className="help-dialog game-picker"
        role="dialog"
        aria-modal="true"
        aria-labelledby="game-picker-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="help-dialog__header">
          <h2 id="game-picker-title" className="help-dialog__title">
            Choose a game
          </h2>
          <button type="button" className="help-dialog__close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <ul className="game-picker__list">
          {VARIANTS.map((variant) => {
            const active = variant.meta.id === currentId;
            return (
              <li key={variant.meta.id}>
                <button
                  type="button"
                  className={`game-picker__item ${active ? 'game-picker__item--active' : ''}`}
                  onClick={() => {
                    onSelect(variant.meta.id);
                    onClose();
                  }}
                >
                  <span className="game-picker__name">{variant.meta.name}</span>
                  <span className="game-picker__desc">{variant.meta.description}</span>
                  {active ? <span className="game-picker__badge">Playing</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
