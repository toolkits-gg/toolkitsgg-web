'use server';

import type { GameId } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { validateGameId } from '@/features/game/utils/validate-game-id';
import { gameData } from '@/features/game/data';

export const toggleFavoriteGame = async (
  gameId: GameId
): Promise<ActionState> => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!validateGameId(gameId)) {
    throw new Error(`Invalid GameId: ${gameId}`);
  }

  try {
    const { existingFavorite } = await gameData.toggleFavoriteGame(gameId);

    revalidatePath(`/${gameId}`);
    return toActionState(
      'SUCCESS',
      existingFavorite
        ? 'Game removed from favorites'
        : 'Game added to favorites'
    );
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
