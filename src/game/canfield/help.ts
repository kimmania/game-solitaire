import type { VariantHelp } from '../help';

export const canfieldHelp: VariantHelp = {
  title: 'Canfield',
  intro:
    'A challenging game with a thirteen-card reserve, cyclic foundations, and a single-card draw from stock.',
  sections: [
    {
      title: 'Setup',
      body: [
        'The first card turned up sets the starting rank for all foundations (wrap King to Ace).',
        'Thirteen cards form the reserve — only the top card may be played.',
        'Four tableau columns each start with one face-up card.',
      ],
    },
    {
      title: 'Building',
      body: [
        'Foundations build up in suit from the base rank, wrapping at King.',
        'Tableau builds down in alternating color; empty columns accept any card.',
        'Move face-up stacks between tableau columns when ranks and colors match.',
        'Draw from stock to waste; recycle waste when stock is empty.',
      ],
    },
    {
      title: 'Win',
      body: ['Build all four foundations through the full thirteen ranks.'],
    },
  ],
};
