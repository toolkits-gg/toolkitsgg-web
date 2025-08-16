import type { GameId } from '@prisma/client';
import { coe33Config } from '@/games/coe33/config';
import type { GameConfig } from '@/features/game/types';
import type { BaseItemType } from '@/features/item/types';
import { DefaultLogo, type LogoSize } from '@/components/Logo';

export const noGameConfig: GameConfig<undefined> = {
  id: 'none',
  name: 'Select a game',
  description: undefined,
  label: 'Default',
  path: '/',
  logo: (size: LogoSize) => <DefaultLogo size={size} />,
  themeDefinitions: undefined,
  items: undefined,
  dataUtils: undefined,
  pages: undefined,
};

export const gameConfigs: Record<
  GameId,
  GameConfig<BaseItemType | undefined>
> = {
  none: noGameConfig,
  coe33: coe33Config,
  // Add more game configs here as needed
};

export const allGameConfigs = (
  Object.keys(gameConfigs) as Array<keyof typeof gameConfigs>
).map((key) => gameConfigs[key]);
