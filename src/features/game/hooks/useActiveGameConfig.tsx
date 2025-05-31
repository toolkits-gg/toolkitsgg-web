import { useMemo } from 'react';
import { Logo } from '@/components/logo';
import { allGameConfigs } from '@/features/game/constants';
import type { GameConfig } from '@/features/game/types';

type useActiveGameConfigProps = {
  gameId?: string;
};

const useActiveGameConfig = ({ gameId }: useActiveGameConfigProps) => {
  const defaultConfig: GameConfig = useMemo(
    () => ({
      id: 'default',
      name: 'Select a game',
      path: '',
      themeCSSClass: 'default-dark',
      logo: <Logo gameId="default" size={128} />,
    }),
    []
  );

  const activeGameConfig = useMemo(() => {
    const gameConfig = allGameConfigs.find((config) => config.id === gameId);

    if (!gameConfig) {
      return defaultConfig;
    }

    return gameConfig;
  }, [gameId, defaultConfig]);

  return {
    activeGameConfig,
  };
};

export { useActiveGameConfig };
