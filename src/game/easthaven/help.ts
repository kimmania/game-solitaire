import type { VariantHelp } from '../help';

export const easthavenHelp: VariantHelp = {
  title: 'How to play Easthaven',
  intro:
    'Build foundations from Ace to King by suit. Tableau builds down in the same suit; only one card moves at a time.',
  sections: [
    {
      title: 'The layout',
      body: [
        'Seven tableau columns with a triangular deal (like Klondike).',
        'Stock and waste (top left): draw one card at a time.',
        'Four foundations: build up by suit from Ace to King.',
      ],
    },
    {
      title: 'Tableau rules',
      body: [
        'Build down in the same suit (not alternating colors).',
        'Only one card may be moved at a time.',
        'Any single card may be placed on an empty column.',
        'When you remove a face-up card, the card below flips face up.',
      ],
    },
    {
      title: 'Stock and waste',
      body: [
        'Tap the stock to draw one card to the waste.',
        'When the stock is empty, you may recycle the waste back into the stock once.',
        'After that one recycle, the stock cannot be refilled again.',
      ],
    },
    {
      title: 'Controls in this app',
      body: [
        'Tap a card to select it; tap a highlighted pile to move.',
        'After drawing, the waste card is selected automatically.',
        'Tap a selected card again to deselect.',
        'Double-tap a top card to send it to a foundation when possible.',
      ],
    },
  ],
};
