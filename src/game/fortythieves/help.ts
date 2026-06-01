import type { VariantHelp } from '../help';

export const fortyThievesHelp: VariantHelp = {
  title: 'Forty Thieves',
  intro:
    'A two-deck game with ten tableau columns and eight foundations. Build the tableau down in the same suit; build foundations up in suit from Ace to King.',
  sections: [
    {
      title: 'Tableau',
      body: [
        'Each column starts with four face-up cards.',
        'Build down in the same suit (for example, 9♥ on 10♥).',
        'Only the top card of each column may move.',
        'Empty columns accept a King only.',
      ],
    },
    {
      title: 'Foundations & stock',
      body: [
        'Eight foundation piles — two per suit. Place Aces on empty foundations, then build up to King in suit.',
        'Draw one card at a time from the stock to the waste. Play the waste top to tableau or foundation.',
        'When the stock is empty, recycle the waste back into the stock (unlimited).',
      ],
    },
    {
      title: 'Win',
      body: ['Move all 104 cards onto the foundations (13 cards on each of the eight piles).'],
    },
  ],
};
