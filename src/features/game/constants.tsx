import type { GameId } from '@prisma/client';
import { Logo } from '@/components/logo';
import { clairObscurConfig } from '@/features/game/games/coe33/config';
import type { GameConfig } from '@/features/game/types';
import type { BaseItemType } from '@/features/item/types';

export const noGameConfig: GameConfig<undefined> = {
  id: 'none',
  name: 'Select a game',
  description: undefined,
  label: 'Default',
  path: '/',
  logo: <Logo gameId="none" size={128} />,
  themeCSSClass: 'default',
  items: undefined,
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
