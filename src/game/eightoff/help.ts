import type { VariantHelp } from '../help';

export const eightOffHelp: VariantHelp = {
  title: 'Eight Off',
  intro:
    'Like FreeCell with eight cells and eight columns. Build the tableau down in the same suit; build foundations from Ace to King.',
  sections: [
    {
      title: 'Layout',
      body: [
        'Eight columns of six face-up cards, four cards dealt into the first four cells, and four empty cells.',
        'Four foundations build up in suit from Ace.',
      ],
    },
    {
      title: 'Moving',
      body: [
        'Move valid descending same-suit stacks between columns.',
        'Single cards can go to empty cells or onto foundations.',
        'Stack size is limited by empty cells and empty columns (same formula as FreeCell).',
      ],
    },
    {
      title: 'Win',
      body: ['Move all cards to the foundations.'],
    },
  ],
};
