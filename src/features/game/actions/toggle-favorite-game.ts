'use server';

import type { GameId } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import prisma from '@/lib/prisma';

export const toggleFavoriteGame = async (
  gameId: GameId
): Promise<ActionState> => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  try {
    const isCurrentlyFavorite = await prisma.userFavoriteGame.findFirst({
      where: {
        userId: user.id,
        gameId: gameId,
      },
    });

    if (isCurrentlyFavorite) {
      // Remove from favorites
      await prisma.userFavoriteGame.delete({
        where: {
          id: {
            userId: user.id,
            gameId: gameId,
          },
        },
      });
      revalidatePath(`/${gameId}`);
      return toActionState('SUCCESS', 'Game removed from favorites');
    } else {
      // Add to favorites
      await prisma.userFavoriteGame.create({
        data: {
          userId: user.id,
          gameId: gameId,
        },
      });

      revalidatePath(`/${gameId}`);
      return toActionState('SUCCESS', 'Game added to favorites');
    }
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
