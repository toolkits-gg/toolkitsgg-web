import type { GameConfig } from '@/features/games/types';
import { logosPath } from '@/paths';
import Image from 'next/image';

export const clairObscurConfig: GameConfig = {
  name: 'Clair Obscur',
  themeCSSClass: 'clair-obscur',
  path: () => '/games/clair-obscur',
  logo: (
    <Image
      src={`${logosPath()}/256C33.png`}
      width={256}
      height={256}
      alt="Toolkits.gg Clair Obscur logo"
    />
  ),
};
