import type { GameConfig } from '@/features/games/types';
import { logosPath } from '@/paths';
import Image from 'next/image';

export const testGameConfig: GameConfig = {
  name: 'Test Game',
  themeCSSClass: 'default',
  path: () => '/games/test-game',
  logo: (
    <Image
      src={`${logosPath()}/256Clean.png`}
      width={256}
      height={256}
      alt="Toolkits.gg Test Game logo"
    />
  ),
};
