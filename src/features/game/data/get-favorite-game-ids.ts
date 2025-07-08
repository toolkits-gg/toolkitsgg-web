import { getAuth } from '@/features/auth/queries/get-auth';
import prisma from '@/lib/prisma';

export const getFavoriteGameIds = async (): Promise<string[]> => {
  const { user } = await getAuth();
  if (!user) {
    return [];
  }

  const favoriteGames = await prisma.userFavoriteGame.findMany({
    where: {
      userId: user.id,
    },
    select: {
      gameId: true,
    },
  });

  return favoriteGames.map((favoriteGame) => favoriteGame.gameId);
};
