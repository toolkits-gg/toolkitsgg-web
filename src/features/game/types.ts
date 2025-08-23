import type { GameId } from '@prisma/client';
import type React from 'react';
import type { LogoSize } from '@/components/Logo';
import type { ToolkitThemeDefinition } from '@/features/theme/types';

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

type GameConfigPage = {
  component: React.ReactNode;
  path: string;
};

export type GameConfig<ItemType> = {
  id: GameId;
  name: string;
  description: string | undefined;
  label: string;
  path: string;
  logo: (size: LogoSize) => React.ReactNode;
  items: ItemType[] | undefined;
  themeDefinition: ToolkitThemeDefinition | undefined;

  pages:
    | {
        home: GameConfigPage | undefined;
        itemLookup: GameConfigPage | undefined;
        itemCollector: GameConfigPage | undefined;
        itemQuiz: GameConfigPage | undefined;
      }
    | undefined;

  /* Utility functions for interacting with the data layer **/
  dataUtils: GameDataUtils | undefined;

  // TODO: Enable builds a different way, like with items
  buildsEnabled?: boolean;
} & ResourcesArgs;
