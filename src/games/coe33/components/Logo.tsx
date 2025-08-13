import { defaultLogoSize, Logo, type LogoSize } from '@/components/Logo';
import { logosPath } from '@/paths';

type COE33LogoProps = {
  size?: LogoSize;
};

const COE33Logo = ({ size = defaultLogoSize }: COE33LogoProps) => {
  console.log(`${logosPath()}/${size}C33.png`);

  // Logo sizes don't go lower than 64
  // The image path needs a safe size
  const safeSize = size < 64 ? 64 : size;

  return (
    <Logo
      path={`${logosPath()}/${safeSize}C33.png`}
      size={size}
      alt="Clair Obscur logo overlayed on a toolbox"
    />
  );
};

export { COE33Logo };
