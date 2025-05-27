import {
  type ThemeName,
  themePrimaryColors
} from '@/components/theme/constants';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemeColorButtonProps = {
  themeName: ThemeName;
  isLightMode: boolean;
  onChangeTheme: (theme: string) => void;
};

const ThemeColorButton = ({
  themeName,
  isLightMode,
  onChangeTheme
}: ThemeColorButtonProps) => {
  const adjustedThemeName = isLightMode ? `${themeName}-light` : themeName;

  const handleChangeTheme = () => {
    onChangeTheme(adjustedThemeName);
  };

  return (
    <Button
      variant="default"
      key={adjustedThemeName}
      onClick={handleChangeTheme}
      className={cn('w-12 h-12', themePrimaryColors[themeName])}
    >
      <span className="sr-only">Toggle color</span>
    </Button>
  );
};

export { ThemeColorButton };
