import { Logo } from '@/components/logo';
import {
  coe33Items,
  type COE33ItemType,
} from '@/features/game/games/coe33/items';
import {
  coe33Path,
  itemLookupPath,
  itemQuizPath,
  itemTrackerPath,
  resourcesPath,
} from '@/features/game/games/coe33/paths';
import type { GameConfig } from '@/features/game/types';

export const clairObscurConfig: GameConfig<COE33ItemType> = {
  name: 'Clair Obscur: Expedition 33',
  label: 'Clair Obscur',
  description: `Lead the members of Expedition 33 on their quest to destroy the Paintress so that she can never paint death again. Explore a world of wonders inspired by Belle Époque France and battle unique enemies in this turn-based RPG with real-time mechanics.`,
  id: 'coe33',
  themeDefinitions: [
    {
      label: 'Clair Obscur',
      className: 'coe33-light',
      mode: 'Light',
    },
    {
      label: 'Clair Obscur',
      className: 'coe33-dark',
      mode: 'Dark',
    },
  ],
  path: coe33Path(),
  logo: <Logo gameId="coe33" size={128} />,

  buildsEnabled: false,

  items: coe33Items,
  itemLookupPath: itemLookupPath(),
  itemTrackerPath: itemTrackerPath(),
  itemQuizPath: itemQuizPath(),

  resourcesPath: resourcesPath(),
  resources: [
    {
      title: 'Official Wiki',
      url: '#',
    },
  ],
};
