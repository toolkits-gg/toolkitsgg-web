import Image from 'next/image';
import { logosPath } from '@/paths';

export type LogoSize = 64 | 128 | 256 | 512 | 1024;
export const defaultLogoSize: LogoSize = 128;

type LogoProps = {
  path: string;
  alt: string;
  size?: LogoSize;
};

const Logo = ({ path, size = defaultLogoSize, alt }: LogoProps) => {
  return (
    <Image
      src={path}
      alt={alt}
      width={size}
      height={size}
      loading="eager"
      priority
    />
  );
};

const CleanLogo = ({
  size = defaultLogoSize,
}: {
  size?: LogoProps['size'];
}) => {
  return (
    <Logo
      path={`${logosPath()}/128Clean.png`}
      size={size}
      alt="Logo of a purple and yellow toolbox."
    />
  );
};

const DefaultLogo = ({
  size = defaultLogoSize,
}: {
  size?: LogoProps['size'];
}) => {
  return (
    <Logo
      path={`${logosPath()}/LogoToxicGreen.png`}
      size={size}
      alt="Logo of a purple and yellow toolbox."
    />
  );
};

const AnimatedLogo = ({
  size = defaultLogoSize,
}: {
  size?: LogoProps['size'];
}) => {
  return (
    <Logo
      path={`${logosPath()}/${size === 64 ? 64 : 128}GradientTK.gif`}
      size={size}
      alt="Animated logo of a purple and yellow toolbox."
    />
  );
};

export { Logo, CleanLogo, DefaultLogo, AnimatedLogo };
