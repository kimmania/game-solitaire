import type { VariantHelp } from '../help';

export const scorpionHelp: VariantHelp = {
  title: 'Scorpion',
  intro:
    'Sort the deck into four complete same-suit sequences from King down to Ace. The first four columns start with buried cards.',
  sections: [
    {
      title: 'Layout',
      body: [
        'Four columns of seven cards (three face down, four face up) and three columns of three face-up cards.',
        'Remaining cards form the stock.',
      ],
    },
    {
      title: 'Moving',
      body: [
        'Build tableau down in the same suit.',
        'Move any face-up run that forms a valid descending same-suit stack.',
        'Empty columns accept a King only.',
        'When a full King-to-Ace run is exposed, it is cleared automatically.',
      ],
    },
    {
      title: 'Stock',
      body: [
        'When no empty columns remain, deal one stock card to each of the first four columns.',
        'Face-down cards flip when uncovered.',
      ],
    },
    {
      title: 'Win',
      body: ['Clear four complete King-to-Ace sequences.'],
    },
  ],
};
