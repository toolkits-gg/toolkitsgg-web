import { Logo } from '@/components/logo';
import type { GameConfig } from '@/features/game/types';

export const noGameConfig: GameConfig = {
  id: 'none',
  name: 'Select a game',
  path: '/',
  logo: <Logo gameId="none" size={128} />,
  themeCSSClass: 'default',
};
