import type { VariantHelp } from '../help';

export const spiderHelp: VariantHelp = {
  title: 'How to play Spider (1 suit)',
  intro:
    'Build descending sequences from King to Ace in a single suit. Complete eight King-through-Ace runs to win.',
  sections: [
    {
      title: 'The layout',
      body: [
        'Ten tableau columns hold the cards.',
        'Stock (top left): deals one face-up card to each column when you tap it.',
        'Foundations counter: shows how many complete King-through-Ace sequences you have cleared (8 to win).',
      ],
    },
    {
      title: 'Tableau rules',
      body: [
        'Build down by rank (King, Queen, Jack, …). All cards are the same suit in this version.',
        'Move any valid descending stack of face-up cards to another column.',
        'Any card or stack may be placed on an empty column.',
        'When a full 13-card run from King down to Ace is formed, it is removed automatically.',
      ],
    },
    {
      title: 'Dealing',
      body: [
        'Tap the stock to deal one card to each column.',
        'You cannot deal while any column is empty.',
        'When the stock is empty, keep moving cards until you complete all eight sequences or get stuck.',
      ],
    },
    {
      title: 'Controls in this app',
      body: [
        'Tap a face-up card to select a stack; tap a highlighted column to move.',
        'Tap a selected card again to deselect it.',
        'Tap the stock pile to deal a new row.',
      ],
    },
  ],
};
