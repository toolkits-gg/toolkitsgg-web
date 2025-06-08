import { Logo } from '@/components/logo';
import {
  coe33Items,
  type COE33ItemType,
} from '@/features/game/games/coe33/items';
import type { GameConfig } from '@/features/game/types';

export const clairObscurConfig: GameConfig<COE33ItemType> = {
  name: 'Clair Obscur: Expedition 33',
  label: 'Clair Obscur',
  id: 'coe33',
  themeCSSClass: 'coe33',
  path: 'coe33',
  logo: <Logo gameId="coe33" size={128} />,
  items: coe33Items,
};
