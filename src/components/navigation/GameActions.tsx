'use client';

import { Flex } from '@mantine/core';
import type { GameId } from '@prisma/client';
import { FavoriteGameButton } from '@/components/navigation/FavoriteGameButton';
import { useAuth } from '@/features/auth/hooks/use-auth';

type GameActionsProps = {
  gameId: GameId;
};

const GameActions = ({ gameId }: GameActionsProps) => {
  const { user } = useAuth();

  // TODO: Get user favorite games for the state of the game actions button

  // const favoriteGameIds = await gameData.getFavoriteGameIds();
  // const isFavorite = favoriteGameIds.some(
  //   (favoriteGameId) => favoriteGameId === gameId
  // );

  const gameActionsVisible = gameId !== 'none' && user;
  if (!gameActionsVisible) {
    return null;
  }

  return (
    <Flex justify="flex-end" align="center" w="100%">
      <FavoriteGameButton gameId={gameId} isFavorite={false} />
    </Flex>
  );
};

export { GameActions };
