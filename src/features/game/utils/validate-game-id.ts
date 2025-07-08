import { allGameConfigs } from '@/features/game/constants';

export const validateGameId = (gameId: string) => {
  return !!allGameConfigs.find((gameConfig) => gameConfig.id === gameId);
};
