import * as getCollectedItemSlugs from '@/games/coe33/data/get-collected-item-slugs';
import * as toggleCollectedItem from './toggle-collected-item';
import type { GameDataUtils } from '@/features/game/types';

export const coe33DataUtils: GameDataUtils = {
  ...getCollectedItemSlugs,
  ...toggleCollectedItem,
};
