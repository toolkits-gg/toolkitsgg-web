import type { allGameConfigs } from '@/features/games/constants';

export type GameConfig = {
  id: string;
  name: string;
  logo: React.ReactElement<HTMLElement>;
  themeCSSClass: string;
};

export type GameConfigKey = keyof typeof allGameConfigs;
