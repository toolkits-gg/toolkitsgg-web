import { defaultLogoSize, Logo, type LogoSize } from '@/components/logo';
import { logosPath } from '@/paths';

type Remnant2LogoProps = {
  size?: LogoSize;
};

const Remnant2Logo = ({ size = defaultLogoSize }: Remnant2LogoProps) => {
  return (
    <Logo
      path={`${logosPath()}/${size}R2.png`}
      size={size}
      alt="Remnant 2 logo overlayed on a toolbox"
    />
  );
};

export { Remnant2Logo };
