import type { GameId } from '@prisma/client';
import type { ThemeDefinition } from '@/features/theme/constants';

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

export type GameData = {
  toggleCollectedItem: (itemSlug: string) => Promise<{
    isCollected: boolean;
  }>;
  getCollectedItemSlugs: () => Promise<string[]>;
};

export type GameConfig<ItemType> = {
  id: GameId;
  name: string;
  description: string | undefined;
  label: string;
  path: string;
  logo: React.ReactElement<HTMLElement>;
  themeDefinitions?: ThemeDefinition[];

  gameData: GameData | undefined;

  buildsEnabled?: boolean;
} & ItemsArgs<ItemType> &
  ResourcesArgs;
