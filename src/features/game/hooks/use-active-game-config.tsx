import { useTheme } from 'next-themes';
import { useMemo, useRef } from 'react';
import { allGameConfigs } from '@/features/game/constants';
import { noGameConfig } from '@/features/game/games/no-game-config';
import type { GameId } from '@/features/game/types';

type UseActiveGameConfigArgs = {
  gameId: GameId | undefined;
};

const useActiveGameConfig = ({ gameId }: UseActiveGameConfigArgs) => {
  const { theme } = useTheme();

  const validatedGameId = useRef<GameId | undefined>(gameId);

  const activeGameConfig = useMemo(() => {
    if (!gameId) {
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
  }, [gameId, theme]);

  return {
    activeGameConfig,
    validatedGameId,
  };
};

export { useActiveGameConfig };
