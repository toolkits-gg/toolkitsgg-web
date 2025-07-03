import type { GameId } from '@prisma/client';
import { usePathname } from 'next/navigation';
import { useMemo, useRef } from 'react';
import { allGameConfigs, noGameConfig } from '@/features/game/constants';
import { allThemeClassNames } from '@/features/theme/constants';
import { useAppTheme } from '@/features/theme/hooks/use-theme';

type UseActiveGameConfigArgs = {
  gameId: GameId | undefined;
};

const useActiveGameConfig = ({ gameId }: UseActiveGameConfigArgs) => {
  const { colorTheme } = useAppTheme();

  const pathname = usePathname();

  const validatedGameId = useRef<GameId | undefined>(gameId);

  const activeGameConfig = useMemo(() => {
    if (!gameId && pathname !== '/') {
      validatedGameId.current =
        (allThemeClassNames.find(
          (className) => colorTheme === className
        ) as GameId) || noGameConfig.id;
    }

    const gameConfig = allGameConfigs.find(
      (config) => config.id === validatedGameId.current
    );

    if (!gameConfig) {
      return noGameConfig;
    }

    return gameConfig;
  }, [pathname, gameId, colorTheme]);

  return {
    activeGameConfig,
    validatedGameId,
  };
};

export { useActiveGameConfig };
