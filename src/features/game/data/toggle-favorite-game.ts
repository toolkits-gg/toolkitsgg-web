import type { GameId } from '@prisma/client';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import prisma from '@/lib/prisma';

export const toggleFavoriteGame = async (gameId: GameId) => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const existingFavorite = await prisma.userFavoriteGame.findUnique({
    where: {
      id: {
        userId: user.id,
        gameId,
      },
    },
  });

  if (existingFavorite) {
    return await prisma.userFavoriteGame.delete({
      where: {
        id: {
          userId: user.id,
          gameId,
        },
      },
    });
  }

  return await prisma.userFavoriteGame.create({
    data: {
      userId: user.id,
      gameId,
    },
  });
};
