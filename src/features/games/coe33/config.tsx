import type { GameConfig } from '@/features/games/types';
import { logosPath } from '@/paths';
import Image from 'next/image';

export const clairObscurConfig: GameConfig = {
  name: 'Clair Obscur',
  id: 'coe33',
  themeCSSClass: 'coe33',
  path: 'coe33',
  logo: (
    <Image
      src={`${logosPath()}/256C33.png`}
      width={256}
      height={256}
      alt="Toolkits.gg Clair Obscur logo"
    />
  ),
};
