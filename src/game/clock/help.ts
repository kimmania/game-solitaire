import type { VariantHelp } from '../help';

export const clockHelp: VariantHelp = {
  title: 'Clock',
  intro:
    'Twelve hour piles around the dial plus a center pile for kings. Turn cards onto the pile matching their rank.',
  sections: [
    {
      title: 'Playing',
      body: [
        'Tap the active pile to turn its next face-down card.',
        'Aces go to 1 o’clock, 2s to 2 o’clock, … queens to 12, kings to the center.',
        'The next turn comes from the pile where you placed the card.',
      ],
    },
    {
      title: 'Win and lose',
      body: [
        'Win by revealing all 52 cards on their correct piles.',
        'Lose if the fourth king reaches the center before every card is out.',
      ],
    },
  ],
};
