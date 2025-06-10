import type { GameId } from '@prisma/client';
import { gameConfigs } from '@/features/game/constants';

type ItemsArgs<ItemType> =
  | {
      items: ItemType[];
      itemLookupPath: string;
      itemTrackerPath: string;
      itemQuizPath: string;
    }
  | {
      items?: undefined;
      itemLookupPath?: undefined;
      itemTrackerPath?: undefined;
      itemQuizPath?: undefined;
    };

type ResourcesArgs =
  | {
      resources: Array<{
        title: string;
        url: string;
      }>;
      resourcesPath: string;
    }
  | {
      resources?: undefined;
      resourcesPath?: undefined;
    };

export type GameConfig<ItemType> = {
  id: GameId;
  name: string;
  description: string | undefined;
  label: string;
  path: string;
  logo: React.ReactElement<HTMLElement>;
  themeCSSClass: string;

  buildsEnabled?: boolean;
} & ItemsArgs<ItemType> &
  ResourcesArgs;

export function isGameId(id: string): id is GameId {
  return Object.keys(gameConfigs).includes(id);
}

export function toGameId(id: string | undefined): GameId {
  if (!id) {
    return 'none';
  }
  return isGameId(id) ? (id as GameId) : 'none';
}
