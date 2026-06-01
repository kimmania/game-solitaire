import { useEffect, useId, useRef } from 'react';
import type { VariantHelp } from '../game/help';

interface HelpDialogProps {
  help: VariantHelp;
  open: boolean;
  onClose: () => void;
}

export function HelpDialog({ help, open, onClose }: HelpDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="help-backdrop" onClick={onClose}>
      <div
        className="help-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="help-dialog__header">
          <h2 id={titleId} className="help-dialog__title">
            {help.title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            className="help-dialog__close"
            onClick={onClose}
            aria-label="Close help"
          >
            ×
          </button>
        </header>

        <div className="help-dialog__body">
          <p className="help-dialog__intro">{help.intro}</p>

          {help.sections.map((section) => (
            <section key={section.title} className="help-section">
              <h3 className="help-section__title">{section.title}</h3>
              <ul className="help-section__list">
                {section.body.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="help-dialog__footer">
          <button type="button" className="btn" onClick={onClose}>
            Got it
          </button>
        </footer>
      </div>
    </div>
  );
}
