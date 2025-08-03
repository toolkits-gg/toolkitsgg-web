import type { GameId } from '@prisma/client';
import type { ThemeDefinition } from '@/features/theme/constants';
import type { LogoSize } from '@/components/Logo';
import type { JSX } from 'react';

type ItemsArgs<ItemType> =
  | {
      items: ItemType[];
      itemLookupPath: string;
      itemCollectorPath: string;
      itemQuizPath: string;
    }
  | {
      items?: undefined;
      itemLookupPath?: undefined;
      itemCollectorPath?: undefined;
      itemQuizPath?: undefined;
    };

type ResourcesArgs =
  | {
      resources: Array<{
        label: string;
        link: string;
      }>;
      resourcesPath: string;
    }
  | {
      resources?: undefined;
      resourcesPath?: undefined;
    };

export type GameDataUtils = {
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
  logo: (size: LogoSize) => React.ReactNode;
  themeDefinitions?: ThemeDefinition[];

  /* Utility functions for interacting with the data layer **/
  dataUtils: GameDataUtils | undefined;

  // TODO: Enable builds a different way, like with items
  buildsEnabled?: boolean;
} & ItemsArgs<ItemType> &
  ResourcesArgs;
