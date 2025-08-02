import { COE33Logo } from '@/games/coe33/components/logo';
import { coe33DataUtils } from '@/games/coe33/data';
import {
  coe33Path,
  itemCollectorPath,
  itemLookupPath,
  itemQuizPath,
  resourcesPath,
} from '@/games/coe33/paths';
import type { GameConfig } from '@/features/game/types';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { coe33Items } from '@/games/coe33/items/all-items';

export const coe33Config: GameConfig<COE33ItemType> = {
  name: 'Clair Obscur: Expedition 33',
  label: 'Clair Obscur',
  description: `Lead the members of Expedition 33 on their quest to destroy the Paintress so that she can never paint death again. Explore a world of wonders inspired by Belle Époque France and battle unique enemies in this turn-based RPG with real-time mechanics.`,
  id: 'coe33',
  // themeDefinitions: [
  //   {
  //     label: 'Clair Obscur',
  //     className: 'coe33-light',
  //   },
  //   {
  //     label: 'Clair Obscur',
  //     className: 'coe33-dark',
  //   },
  // ],
  path: coe33Path(),
  logo: <COE33Logo size={128} />,

  buildsEnabled: false,

  dataUtils: coe33DataUtils,

  items: coe33Items,
  itemLookupPath: itemLookupPath(),
  itemCollectorPath: itemCollectorPath(),
  itemQuizPath: itemQuizPath(),

  resourcesPath: resourcesPath(),
  resources: [
    {
      title: 'Official Wiki',
      url: '#', // TODO: maru please
    },
  ],
};
