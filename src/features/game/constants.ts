import { clairObscurConfig } from '@/features/game/games/coe33/config';
import { noGameConfig } from '@/features/game/games/no-game-config';
import type { GameConfig } from '@/features/game/types';

export const gameConfigs = {
  none: noGameConfig,
  coe33: clairObscurConfig,
  // Add more game configs here as needed
} as const satisfies Record<string, GameConfig>;

export const allGameConfigs = (
  Object.keys(gameConfigs) as Array<keyof typeof gameConfigs>
).map((key) => gameConfigs[key]);
