import { toGameConfig } from '@/features/game/utils';
import type { GameId } from '@prisma/client';

export const validateItemSlug = (gameId: GameId, itemSlug: string) => {
  const gameConfig = toGameConfig(gameId);
  return !!gameConfig?.items?.find((item) => item?.slug === itemSlug);
};
