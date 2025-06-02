import Image from 'next/image';
import type { GameId } from '@/features/game/types';
import { logosPath } from '@/paths';

type LogoProps = {
  gameId: GameId;
  size?: 64 | 128 | 256 | 512 | 1024;
};

const Logo = ({ gameId, size = 128 }: LogoProps) => {
  let logoPath = `${logosPath()}/${size}Clean.png`;
  let altText = 'Logo of a purple and yellow toolbox.';

  switch (gameId) {
    case 'none':
      logoPath = `${logosPath()}/LogoToxicGreen.png`;
      altText = 'Logo of a purple and yellow toolbox.';
      break;
    case 'coe33':
      logoPath = `${logosPath()}/${size}C33.png`;
      altText = 'Logo of the Clair Obscur logo mixed with a toolbox.';
      break;
    default:
      logoPath = `${logosPath()}/${size}Clean.png`;
      altText = 'Logo of a purple and yellow toolbox.';
      break;
  }

  return (
    <Image
      src={logoPath}
      alt={altText}
      width={size}
      height={size}
      loading="eager"
      priority
    />
  );
};

export { Logo };
