import { allGameConfigs, gameConfigs } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';
import type { BaseItemType } from '@/features/item/types';
import type { GameId } from '@prisma/client';

const isGameId = (id: string): id is GameId => {
  return Object.keys(gameConfigs).includes(id);
};

const toGameId = (id: string | undefined): GameId => {
  if (!id) {
    return 'none';
  }
  return isGameId(id) ? (id as GameId) : 'none';
};

function toGameConfig<ItemType extends BaseItemType = BaseItemType>(
  gameId: GameId | undefined
): GameConfig<ItemType> | undefined {
  if (!gameId) {
    return undefined;
  }

  return allGameConfigs.find((config) => config.id === gameId) as
    | GameConfig<ItemType>
    | undefined;
}

export const gameUtils = {
  isGameId,
  toGameId,
  toGameConfig,
};
