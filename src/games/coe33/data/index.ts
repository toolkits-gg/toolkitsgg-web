import * as getCollectedItemSlugs from '@/games/coe33/data/get-collected-item-slugs';
import * as toggleCollectedItem from './toggle-collected-item';
import type { GameDataHelpers } from '@/features/game/types';

export const coe33DataHelpers: GameDataHelpers = {
  ...getCollectedItemSlugs,
  ...toggleCollectedItem,
};
