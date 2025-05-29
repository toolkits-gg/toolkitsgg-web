import type { allGameConfigs } from '@/features/games/constants';

export type GameConfig = {
  id: string; // path is derived from id
  name: string;
  logo: React.ReactElement<HTMLElement>;
  themeCSSClass: string;
};
