import type { VariantHelp } from '../help';
import type { SpiderVariantId } from './types';

const sharedSections: VariantHelp['sections'] = [
  {
    title: 'The layout',
    body: [
      'Ten tableau columns hold the cards.',
      'Stock (top left): deals one face-up card to each column when you tap it.',
      'Foundations counter: shows how many complete King-through-Ace sequences you have cleared (8 to win).',
    ],
  },
  {
    title: 'Dealing',
    body: [
      'Tap the stock to deal one card to each column.',
      'You cannot deal while any column is empty.',
      'When the stock is empty, keep moving cards until you complete all eight sequences or get stuck.',
    ],
  },
  {
    title: 'Controls in this app',
    body: [
      'Tap a face-up card to select a stack; tap a highlighted column to move.',
      'Tap a selected card again to deselect it.',
      'Tap the stock pile to deal a new row.',
    ],
  },
];

const tableauByMode: Record<SpiderVariantId, string[]> = {
  spider: [
    'Build down by rank (King, Queen, Jack, …). Suits are ignored — all cards play as one suit.',
    'Move any valid descending stack of face-up cards to another column.',
    'Any card or stack may be placed on an empty column.',
    'A complete run is King through Ace (13 cards); it is removed automatically.',
  ],
  'spider-2': [
    'Build down by rank in the same suit (spades or hearts).',
    'You may only move a stack if every card in it is the same suit and in descending order.',
    'The card you move must match the destination suit when placed on another card.',
    'Any card or stack may be placed on an empty column.',
    'A complete run is King through Ace in one suit; it is removed automatically.',
  ],
  'spider-4': [
    'Build down by rank in the same suit (hearts, diamonds, clubs, or spades).',
    'You may only move a stack if every card in it is the same suit and in descending order.',
    'The card you move must match the destination suit when placed on another card.',
    'Any card or stack may be placed on an empty column.',
    'A complete run is King through Ace in one suit; it is removed automatically.',
  ],
};

const intros: Record<SpiderVariantId, string> = {
  spider:
    'Build descending sequences from King to Ace. Complete eight runs to win. The easiest Spider variant.',
  'spider-2':
    'Build descending sequences in matching suit using spades and hearts. Complete eight runs to win.',
  'spider-4':
    'Build descending sequences in matching suit using all four suits. Complete eight runs to win.',
};

const titles: Record<SpiderVariantId, string> = {
  spider: 'How to play Spider (1 suit)',
  'spider-2': 'How to play Spider (2 suits)',
  'spider-4': 'How to play Spider (4 suits)',
};

export const spiderHelpByVariant: Record<SpiderVariantId, VariantHelp> = {
  spider: {
    title: titles.spider,
    intro: intros.spider,
    sections: [
      sharedSections[0],
      { title: 'Tableau rules', body: tableauByMode.spider },
      sharedSections[1],
      sharedSections[2],
    ],
  },
  'spider-2': {
    title: titles['spider-2'],
    intro: intros['spider-2'],
    sections: [
      sharedSections[0],
      { title: 'Tableau rules', body: tableauByMode['spider-2'] },
      sharedSections[1],
      sharedSections[2],
    ],
  },
  'spider-4': {
    title: titles['spider-4'],
    intro: intros['spider-4'],
    sections: [
      sharedSections[0],
      { title: 'Tableau rules', body: tableauByMode['spider-4'] },
      sharedSections[1],
      sharedSections[2],
    ],
  },
};

/** @deprecated Use spiderHelpByVariant */
export const spiderHelp = spiderHelpByVariant.spider;
