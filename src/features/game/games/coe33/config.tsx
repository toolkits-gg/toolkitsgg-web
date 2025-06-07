import { Logo } from '@/components/logo';
import type { GameConfig } from '@/features/game/types';

export const clairObscurConfig: GameConfig = {
  name: 'Clair Obscur: Expedition 33',
  id: 'coe33',
  themeCSSClass: 'coe33',
  path: 'coe33',
  logo: <Logo gameId="coe33" size={128} />,
};
