import type { VariantHelp } from '../help';

export const tripeaksHelp: VariantHelp = {
  title: 'TriPeaks',
  intro:
    'Clear all 28 tableau cards by playing exposed cards onto the waste pile. Each play must be one rank higher or lower than the waste top (Ace and King wrap).',
  sections: [
    {
      title: 'Layout',
      body: [
        'Three overlapping peaks plus a row of ten cards at the base (28 cards). The remaining cards form the stock.',
      ],
    },
    {
      title: 'Playing',
      body: [
        'Tap the stock to flip a card onto the waste when you need a new lead card.',
        'Tap an exposed tableau card that is one rank above or below the waste top to move it onto the waste.',
        'A card is exposed when no cards remain directly below it in the next row.',
        'When the stock is empty, tap the empty stock to recycle the waste back into the stock (unlimited).',
      ],
    },
    {
      title: 'Win',
      body: ['Remove every tableau card and clear both stock and waste.'],
    },
  ],
};
