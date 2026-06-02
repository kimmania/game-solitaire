import type { VariantHelp } from '../help';

export const beleagueredCastleHelp: VariantHelp = {
  title: 'Beleaguered Castle',
  intro:
    'Also known as Fortress. Aces begin on the foundations; kings wait in four reserves while you sort eight tableau columns.',
  sections: [
    {
      title: 'Layout',
      body: [
        'Four aces are placed on the foundations at the deal.',
        'Kings uncovered at the bottom of a column move to the reserves.',
        'The remaining cards fill eight columns of six face-up cards.',
      ],
    },
    {
      title: 'Moving',
      body: [
        'Build foundations up in suit from the aces.',
        'Build tableau down in suit, one card at a time.',
        'Empty columns may be filled from a reserve king first, or any single card.',
      ],
    },
    {
      title: 'Win',
      body: ['Move all cards to the foundations.'],
    },
  ],
};
