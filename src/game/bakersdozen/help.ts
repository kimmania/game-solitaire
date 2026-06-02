import type { VariantHelp } from '../help';

export const bakersDozenHelp: VariantHelp = {
  title: "Baker's Dozen",
  intro:
    'All cards are dealt face up into thirteen columns. Kings are moved to the bottom of their column at the start.',
  sections: [
    {
      title: 'Moving',
      body: [
        'Move one card at a time onto a card of the same suit that is one rank higher.',
        'Empty columns accept any card.',
        'Only the top card of each column may move.',
      ],
    },
    {
      title: 'Win',
      body: [
        'Form four complete columns from King down to Ace in a single suit.',
        'The other nine columns must be empty.',
      ],
    },
  ],
};
