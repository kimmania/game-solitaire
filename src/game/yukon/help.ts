import type { VariantHelp } from '../help';

export const yukonHelp: VariantHelp = {
  title: 'How to play Yukon',
  intro:
    'All 52 cards are dealt face up to the tableau. Move everything to the foundations Ace through King by suit.',
  sections: [
    {
      title: 'The layout',
      body: [
        'Seven tableau columns — no stock or waste pile.',
        'Four foundations (top right): build up by suit from Ace to King.',
      ],
    },
    {
      title: 'Tableau rules',
      body: [
        'Build down in alternating colors on the tableau.',
        'Only a King (or a stack starting with a King) may fill an empty column.',
        'Yukon rule: tap any face-up card to move it and every card on top of it together — the cards between do not need to form a valid sequence.',
        'Only the bottom card of the group you move must legally attach to the destination.',
      ],
    },
    {
      title: 'Controls in this app',
      body: [
        'Tap a card to select its stack; tap a highlighted pile to move.',
        'Tap a selected card again to deselect.',
        'Double-tap a top card to send it to a foundation when possible.',
      ],
    },
  ],
};
