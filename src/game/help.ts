import { klondikeHelp } from './klondike/help';
import type { VariantId } from './registry';

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
};

export function getHelpForVariant(id: VariantId): VariantHelp {
  return HELP_BY_VARIANT[id];
}
