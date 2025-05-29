import { clairObscurConfig } from '@/features/games/coe33/config';
import type { GameConfig } from '@/features/games/types';

export const allGameConfigs: Record<string, GameConfig> = {
  coe33: clairObscurConfig,
  // Add more game configs here as needed
};

export const allGameNames = Object.keys(allGameConfigs).map(
  (key) => allGameConfigs[key].name
);

export const allGameIds = Object.keys(allGameConfigs).map(
  (key) => allGameConfigs[key].id
);

export const allGameLogos = Object.keys(allGameConfigs).map(
  (key) => allGameConfigs[key].logo
);

export const allGameThemeCSSClasses = [
  ...Object.keys(allGameConfigs).map(
    (key) => allGameConfigs[key].themeCSSClass
  ),
];
