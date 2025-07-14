import type { GameId } from '@prisma/client';
import { DefaultLogo } from '@/components/logo';
import { clairObscurConfig } from '@/games/coe33/config';
import type { GameConfig } from '@/features/game/types';
import type { BaseItemType } from '@/features/item/types';

export const noGameConfig: GameConfig<undefined> = {
  id: 'none',
  name: 'Select a game',
  description: undefined,
  label: 'Default',
  path: '/',
  logo: <DefaultLogo />,
  themeDefinitions: undefined,
  items: undefined,
  gameData: undefined,
};

export const gameConfigs: Record<
  GameId,
  GameConfig<BaseItemType | undefined>
> = {
  none: noGameConfig,
  coe33: clairObscurConfig,
  // Add more game configs here as needed
};

export const allGameConfigs = (
  Object.keys(gameConfigs) as Array<keyof typeof gameConfigs>
).map((key) => gameConfigs[key]);
