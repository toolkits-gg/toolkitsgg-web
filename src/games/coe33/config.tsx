import { coe33DataUtils } from '@/games/coe33/data';
import {
  coe33Path,
  itemCollectorPath,
  itemLookupPath,
  resourcesPath,
} from '@/games/coe33/paths';
import type { GameConfig } from '@/features/game/types';
import type { COE33ItemType } from '@/games/coe33/items/types';
import { coe33Items } from '@/games/coe33/items/all-items';
import type { LogoSize } from '@/components/Logo';
import { COE33Logo } from '@/games/coe33/components/Logo';
import { HomePage } from '@/games/coe33/components/HomePage';
import { ItemLookupPage } from '@/games/coe33/components/ItemLookupPage';
import { ItemCollectorPage } from '@/games/coe33/components/ItemCollectorPage';
import {
  coe33Theme,
  coe33ThemeDeuteranopia,
  coe33ThemeProtanopia,
} from '@/games/coe33/theme';

export const coe33Config: GameConfig<COE33ItemType> = {
  name: 'Clair Obscur: Expedition 33',
  label: 'Clair Obscur',
  description: `Lead the members of Expedition 33 on their quest to destroy the Paintress so that she can never paint death again. Explore a world of wonders inspired by Belle Époque France and battle unique enemies in this turn-based RPG with real-time mechanics.`,
  id: 'coe33',
  path: coe33Path(),

  dataUtils: coe33DataUtils,

  pages: {
    home: {
      component: <HomePage />,
      path: coe33Path(),
    },
    itemLookup: {
      component: <ItemLookupPage />,
      path: itemLookupPath(),
    },
    itemCollector: {
      component: <ItemCollectorPage />,
      path: itemCollectorPath(),
    },
    itemQuiz: undefined,
  },

  logo: (size: LogoSize) => <COE33Logo size={size} />,
  items: coe33Items,

  resourcesPath: resourcesPath(),
  resources: [
    {
      label: 'Official Wiki',
      link: '#', // TODO: maru please
    },
  ],

  themeDefinition: {
    label: 'Clair Obscur',
    className: 'coe33',
    theme: coe33Theme,
    themeDeuteranopia: coe33ThemeDeuteranopia,
    themeProtanopia: coe33ThemeProtanopia,
  },
};
