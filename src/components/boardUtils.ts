import type { PileRef } from '../game/variant';

export function pileKey(ref: PileRef): string {
  switch (ref.zone) {
    case 'foundation':
      return 'suit' in ref ? `f-suit-${ref.suit}` : `f-idx-${ref.index}`;
    case 'tableau':
      return `t-${ref.index}`;
    case 'freecell':
      return `fc-${ref.index}`;
    case 'reserve':
      return 'reserve';
    default:
      return ref.zone;
  }
}
