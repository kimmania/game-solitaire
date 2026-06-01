import type { VariantHelp } from '../help';

export const pyramidHelp: VariantHelp = {
  title: 'How to play Pyramid',
  intro:
    'Remove the pyramid by pairing cards that add up to 13. Kings count as 13 and are removed on their own.',
  sections: [
    {
      title: 'Card values',
      body: [
        'Ace = 1, numbered cards face value, Jack = 11, Queen = 12, King = 13.',
        'Valid pairs: Ace + Queen, Two + Jack, Three + Ten, Four + Nine, Five + Eight, Six + Seven.',
        'A King is removed by itself — tap it once.',
      ],
    },
    {
      title: 'What you can remove',
      body: [
        'Two exposed pyramid cards that sum to 13.',
        'One exposed pyramid card and the top waste card that sum to 13.',
        'Only cards not covered by cards below are exposed.',
      ],
    },
    {
      title: 'Stock and waste',
      body: [
        'Tap the stock to turn over one card onto the waste.',
        'You may recycle the waste back into the stock once when the stock is empty.',
        'Win by removing every pyramid card and clearing the stock and waste.',
      ],
    },
    {
      title: 'Controls in this app',
      body: [
        'Tap a King to remove it immediately.',
        'Tap one card, then tap a second that sums to 13 (highlighted in gold).',
        'Tap the same card again to deselect.',
      ],
    },
  ],
};
