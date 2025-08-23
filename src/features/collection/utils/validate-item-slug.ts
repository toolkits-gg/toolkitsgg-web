import type { GameId } from '@prisma/client';
import { gameUtils } from '@/features/game/utils';

export const validateItemSlug = (gameId: GameId, itemSlug: string) => {
  const gameConfig = gameUtils.toGameConfig(gameId);
  return !!gameConfig?.items?.find((item) => item?.slug === itemSlug);
};
