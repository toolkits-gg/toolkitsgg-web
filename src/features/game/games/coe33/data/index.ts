import * as getCollectedItemSlugs from '@/features/game/games/coe33/data/get-collected-item-slugs';
import * as toggleCollectedItem from './toggle-collected-item';
import type { GameData } from '@/features/game/types';

export const coe33Data: GameData = {
  ...getCollectedItemSlugs,
  ...toggleCollectedItem,
};
