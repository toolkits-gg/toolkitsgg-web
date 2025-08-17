'use server';

import type { GameId } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { gameData } from '@/features/game/data';
import { gameUtils } from '@/features/game/utils';
import { formUtils } from '@/components/form/utils';
import type { ActionState } from '@/components/form/types';

export const toggleFavoriteGame = async (
  gameId: GameId
): Promise<ActionState> => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!gameUtils.isGameId(gameId)) {
    throw new Error(`Invalid GameId: ${gameId}`);
  }

  try {
    const { existingFavorite } = await gameData.toggleFavoriteGame(gameId);

    revalidatePath(`/${gameId}`);
    return formUtils.toActionState({
      status: 'SUCCESS',
      message: existingFavorite
        ? 'Game removed from favorites'
        : 'Game added to favorites',
    });
  } catch (error) {
    return formUtils.fromErrorToActionState({ error });
  }
};
