import { Logo } from '@/components/logo';
import type { GameConfig } from '@/features/game/types';
import type { BaseItemType } from '@/features/item/types';

export const remnant2Config: GameConfig<BaseItemType> = {
  name: 'Remnant II',
  label: 'Remnant II',
  description: `REMNANT II® pits survivors of humanity against new deadly creatures and god-like bosses across terrifying worlds. Play solo or co-op with two other friends to explore the depths of the unknown to stop an evil from destroying reality itself.`,
  id: 'rem2',
  // themeDefinitions: [
  //   {
  //     label: 'Remnant 2 Light',
  //     className: 'rem2-light',
  //   },
  //   {
  //     label: 'Remnant 2 Dark',
  //     className: 'rem2-dark',
  //   },
  // ],
  path: '/rem2',
  logo: <Logo gameId="rem2" size={128} />,

  buildsEnabled: false,
  items: undefined,
};
