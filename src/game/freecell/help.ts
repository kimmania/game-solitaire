import type { VariantHelp } from '../help';

export const freecellHelp: VariantHelp = {
  title: 'How to play FreeCell',
  intro: 'Move all cards to the foundations in suit order from Ace to King. All cards are dealt face up.',
  sections: [
    {
      title: 'The layout',
      body: [
        'Free cells (top left): hold one card each — use them as temporary storage.',
        'Foundations (top right): build up by suit from Ace to King.',
        'Tableau (bottom): eight columns; build down in alternating colors.',
      ],
    },
    {
      title: 'Tableau rules',
      body: [
        'Build descending with alternating red and black.',
        'Any single card may be placed on an empty column.',
        'You may move a stack of face-up cards if it forms a valid alternating sequence and the stack is not longer than your move limit.',
        'Move limit: (1 + empty free cells) × 2^(empty tableau columns).',
      ],
    },
    {
      title: 'Controls in this app',
      body: [
        'Tap a card to select it; gold highlights show legal destinations.',
        'Tap a destination to move. Double-tap a top card to auto-move to a foundation when possible.',
        'Only one card may be stored in each free cell.',
        'Tap any card in a column, then tap an empty free cell — the exposed bottom card of that column moves.',
        'Tap a selected free cell again to deselect it.',
      ],
    },
  ],
};
