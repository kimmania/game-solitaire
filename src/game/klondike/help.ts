import type { VariantHelp } from '../help';

export const klondikeHelp: VariantHelp = {
  title: 'How to play Klondike',
  intro:
    'Move all cards to the four foundation piles — one per suit — in order from Ace to King.',
  sections: [
    {
      title: 'The layout',
      body: [
        'Stock (top left): face-down cards you draw from.',
        'Waste: the card(s) drawn from the stock; only the top card can be played.',
        'Foundations (top right): four piles — build each from Ace up to King in the same suit.',
        'Tableau (bottom): seven columns where most of the game is played.',
      ],
    },
    {
      title: 'Tableau rules',
      body: [
        'Build down in alternating colors (red on black, black on red).',
        'Only a King (or a stack starting with a King) may be placed on an empty column.',
        'You may move a face-up stack if cards below it follow descending, alternating-color order.',
        'When you remove the last face-up card from a column, the card below flips face up.',
      ],
    },
    {
      title: 'Stock and waste',
      body: [
        'Cards are played from the waste pile, not directly from the stock.',
        'Tap the stock to turn over one card onto the waste — it is selected automatically.',
        'Then tap a highlighted tableau column or foundation to play that card.',
        'When the stock is empty, tap the empty stock area to recycle the waste back into the stock.',
      ],
    },
    {
      title: 'How to win',
      body: [
        'All 52 cards end up on the foundations — Ace through King in each suit.',
      ],
    },
    {
      title: 'Controls in this app',
      body: [
        'Tap a card to select it; legal destinations show a gold dashed outline — tap one to move.',
        'After drawing from the stock, the waste card stays selected so you can play it immediately.',
        'Tap a face-up tableau card (usually the bottom card of a stack) to place your selection on that column.',
        'Only Kings may go on empty tableau columns.',
        'Double-tap a selected waste or tableau top card to send it to a foundation when allowed.',
        'Use New game in the header to deal a fresh layout. Your current game is saved automatically.',
      ],
    },
  ],
};
