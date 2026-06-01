import { freecellHelp } from './freecell/help';
import { klondikeHelp } from './klondike/help';
import type { VariantId } from './registry';
import { spiderHelpByVariant } from './spider/help';

export interface HelpSection {
  title: string;
  body: string[];
}

export interface VariantHelp {
  title: string;
  intro: string;
  sections: HelpSection[];
}

const HELP_BY_VARIANT: Record<VariantId, VariantHelp> = {
  klondike: klondikeHelp,
  freecell: freecellHelp,
  spider: spiderHelpByVariant.spider,
  'spider-2': spiderHelpByVariant['spider-2'],
  'spider-4': spiderHelpByVariant['spider-4'],
};

export function getHelpForVariant(id: VariantId): VariantHelp {
  return HELP_BY_VARIANT[id];
}
