import type { GameId } from '@prisma/client';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import prisma from '@/lib/prisma';

export const toggleFavoriteGame = async (
  gameId: GameId
): Promise<{ existingFavorite: boolean }> => {
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
    await prisma.userFavoriteGame.delete({
      where: {
        id: {
          userId: user.id,
          gameId,
        },
      },
    });
    return {
      existingFavorite: true,
    };
  }

  await prisma.userFavoriteGame.create({
    data: {
      userId: user.id,
      gameId,
    },
  });

  return {
    existingFavorite: false,
  };
};
