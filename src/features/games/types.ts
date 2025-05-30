import type { allGameConfigs } from '@/features/games/constants';

export type GameConfig = {
  id: string;
  name: string;
  path: string;
  logo: React.ReactElement<HTMLElement>;
  themeCSSClass: string;
};
