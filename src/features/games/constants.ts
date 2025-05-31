import { clairObscurConfig } from '@/features/games/coe33/config';
import type { GameConfig } from '@/features/games/types';

export const gameConfigs: Record<string, GameConfig> = {
  coe33: clairObscurConfig,
  // Add more game configs here as needed
};

export const allGameConfigs = Object.keys(gameConfigs).map(
  (key) => gameConfigs[key]
);
