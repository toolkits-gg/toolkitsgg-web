import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useEffect, useMemo, useRef } from 'react';
import { allGameConfigs } from '@/features/game/constants';
import { noGameConfig } from '@/features/game/games/no-game-config';
import type { GameId } from '@/features/game/types';

type UseActiveGameConfigArgs = {
  gameId: GameId | undefined;
};

const useActiveGameConfig = ({ gameId }: UseActiveGameConfigArgs) => {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const validatedGameId = useRef<GameId | undefined>(gameId);

  const activeGameConfig = useMemo(() => {
    if (!gameId && pathname !== '/') {
      const themeName = theme?.replace(/-dark$/, '');
      validatedGameId.current =
        allGameConfigs.find((config) => config.themeCSSClass === themeName)
          ?.id || noGameConfig.id;
    }

    const gameConfig = allGameConfigs.find(
      (config) => config.id === validatedGameId.current
    );

    if (!gameConfig) {
      return noGameConfig;
    }

    return gameConfig;
  }, [pathname, gameId, theme]);

  useEffect(() => {
    const isDarkMode = theme?.endsWith('-dark');
    const className = isDarkMode
      ? `${activeGameConfig.themeCSSClass}-dark`
      : activeGameConfig.themeCSSClass;

    if (theme !== className) {
      setTheme(className);
    }
  }, [activeGameConfig, theme, setTheme, gameId]);

  return {
    activeGameConfig,
    validatedGameId,
  };
};

export { useActiveGameConfig };
