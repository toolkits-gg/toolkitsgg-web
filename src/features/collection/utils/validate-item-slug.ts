import { configFromGameId } from '@/features/game/utils/game-id';
import type { GameId } from '@prisma/client';

export const validateItemSlug = (gameId: GameId, itemSlug: string) => {
  const gameConfig = configFromGameId(gameId);
  return !!gameConfig?.items?.find((item) => item?.slug === itemSlug);
};
