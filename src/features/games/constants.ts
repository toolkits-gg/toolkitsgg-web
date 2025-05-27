import { clairObscurConfig } from '@/features/games/coe33/config';
import type { GameConfig, GameConfigKey } from '@/features/games/types';

export const allGameConfigs: Record<string, GameConfig> = {
  coe33: clairObscurConfig,
  // Add more game configs here as needed
};

export const allGameNames = (
  Object.keys(allGameConfigs) as Array<GameConfigKey>
).map((key) => allGameConfigs[key].name);
