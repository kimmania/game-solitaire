import type { VariantHelp } from '../help';

export const monteCarloHelp: VariantHelp = {
  title: 'Monte Carlo',
  intro:
    'Clear a 5×5 grid by removing pairs of cards with the same rank that are next to each other horizontally or vertically.',
  sections: [
    {
      title: 'Removing pairs',
      body: [
        'Tap one card, then tap a highlighted neighbor with the same rank to remove both.',
        'Kings match kings, aces match aces, and so on.',
      ],
    },
    {
      title: 'Redeal',
      body: [
        'When no pairs remain, tap the stock to return grid cards to the deck and deal a fresh 5×5 layout.',
        'You cannot redeal while any pair is still available.',
      ],
    },
    {
      title: 'Win',
      body: ['Remove every card from the grid and empty the stock.'],
    },
  ],
};
