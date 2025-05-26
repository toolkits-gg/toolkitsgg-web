import { clairObscurConfig } from '@/features/games/game-configs/clair-obscur';
import { testGameConfig } from '@/features/games/game-configs/test-game';
import type { GameConfig } from '@/features/games/types';

export const ALL_GAME_CONFIGS = {
  clairObscur: clairObscurConfig,
  testGame: testGameConfig,
  // Add more game configs here as needed
} as const satisfies Record<string, GameConfig>;

export type GameConfigKey = keyof typeof ALL_GAME_CONFIGS;

export const ALL_GAME_NAMES = (
  Object.keys(ALL_GAME_CONFIGS) as Array<GameConfigKey>
).map((key) => ALL_GAME_CONFIGS[key].name);
