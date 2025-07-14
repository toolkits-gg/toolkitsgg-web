import { allGameConfigs } from '@/features/game/constants';

export const validateItemSlug = (gameId: string, itemSlug: string) => {
  const gameConfig = allGameConfigs.find((game) => game.id === gameId);
  return !!gameConfig?.items?.find((item) => item?.slug === itemSlug);
};
