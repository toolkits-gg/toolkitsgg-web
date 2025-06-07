import { useTheme } from 'next-themes';
import { useLocalStorage } from 'usehooks-ts';
import { allGameConfigs } from '@/features/game/constants';

const useAppTheme = () => {
  const { theme, setTheme } = useTheme();

  const [gameThemeEnabled, setGameThemeEnabled] = useLocalStorage(
    'gameThemeEnabled',
    true
  );

  const handleLightMode = () => {
    if (!theme) return;
    setTheme(theme.replace('-dark', ''));
  };

  const handleDarkMode = () => {
    if (!theme) return;
    if (theme.indexOf('-dark') === -1) {
      setTheme(`${theme}-dark`);
    }
  };

  const handleToggleTheme = () => {
    if (!theme) return;

    if (theme.indexOf('-dark') === -1) {
      handleDarkMode();
    } else {
      handleLightMode();
    }
  };

  const handleChangeTheme = (gameId: string) => {
    const gameConfig = allGameConfigs.find((config) => config.id === gameId);
    if (!gameConfig) {
      throw new Error(`Game config not found for id: ${gameId}`);
    }
    const isDarkMode = theme?.indexOf('-dark') !== -1;

    const newTheme = isDarkMode
      ? `${gameConfig.themeCSSClass}-dark`
      : gameConfig.themeCSSClass;

    if (theme !== newTheme) {
      setTheme(newTheme);
    }
  };

  return {
    theme,
    gameThemeEnabled,
    setGameThemeEnabled,
    handleLightMode,
    handleDarkMode,
    handleToggleTheme,
    handleChangeTheme,
  };
};

export { useAppTheme };
