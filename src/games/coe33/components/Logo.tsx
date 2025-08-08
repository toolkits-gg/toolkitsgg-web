import { defaultLogoSize, Logo, type LogoSize } from '@/components/Logo';
import { logosPath } from '@/paths';

type COE33LogoProps = {
  size?: LogoSize;
};

const COE33Logo = ({ size = defaultLogoSize }: COE33LogoProps) => {
  return (
    <Logo
      path={`${logosPath()}/${size}C33.png`}
      size={size}
      alt="Clair Obscur logo overlayed on a toolbox"
    />
  );
};

export { COE33Logo };
