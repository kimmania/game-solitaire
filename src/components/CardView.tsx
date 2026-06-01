import { rankLabel, suitColor, suitSymbol, type Card } from '../game/cards';

interface CardViewProps {
  card: Card;
  compact?: boolean;
}

export function CardView({ card, compact }: CardViewProps) {
  if (!card.faceUp) {
    return <div className={`card card--back ${compact ? 'card--compact' : ''}`} aria-hidden />;
  }

  const color = suitColor(card.suit);
  return (
    <div
      className={`card card--face card--${color} ${compact ? 'card--compact' : ''}`}
      aria-label={`${rankLabel(card.rank)} of ${card.suit}`}
    >
      <span className="card__corner card__corner--tl">
        {rankLabel(card.rank)}
        {suitSymbol(card.suit)}
      </span>
      <span className="card__center">{suitSymbol(card.suit)}</span>
      <span className="card__corner card__corner--br">
        {rankLabel(card.rank)}
        {suitSymbol(card.suit)}
      </span>
    </div>
  );
}
