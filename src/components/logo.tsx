import type { GameId } from '@prisma/client';
import Image from 'next/image';
import { logosPath } from '@/paths';

type LogoProps = {
  gameId: GameId | 'animated';
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
    case 'animated':
      logoPath = `${logosPath()}/${size === 64 ? 64 : 128}GradientTK.gif`;
      altText = 'Animated logo of a purple and yellow toolbox.';
      break;
    case 'coe33':
      logoPath = `${logosPath()}/${size}C33.png`;
      altText = 'Logo of the Clair Obscur logo mixed with a toolbox.';
      break;
    case 'rem2':
      logoPath = `${logosPath()}/${size}R2.png`;
      altText = 'Logo of Remnant 2 mixed with a toolbox.';
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
