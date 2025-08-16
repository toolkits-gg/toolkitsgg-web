'use server';

import type { GameId } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { gameData } from '@/features/game/data';
import { isGameId } from '@/features/game/utils/game-utils';
import {
  fromErrorToActionState,
  toActionState,
  type ActionState,
} from '@/components/form/utils/action-state';

export const toggleFavoriteGame = async (
  gameId: GameId
): Promise<ActionState> => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!isGameId(gameId)) {
    throw new Error(`Invalid GameId: ${gameId}`);
  }

  try {
    const { existingFavorite } = await gameData.toggleFavoriteGame(gameId);

    revalidatePath(`/${gameId}`);
    return toActionState({
      status: 'SUCCESS',
      message: existingFavorite
        ? 'Game removed from favorites'
        : 'Game added to favorites',
    });
  } catch (error) {
    return fromErrorToActionState({ error });
  }
};
