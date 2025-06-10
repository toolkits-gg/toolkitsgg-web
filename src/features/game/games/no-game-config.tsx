import { Logo } from '@/components/logo';
import type { GameConfig } from '@/features/game/types';

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
