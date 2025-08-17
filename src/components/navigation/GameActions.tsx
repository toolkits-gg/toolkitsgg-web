import { FavoriteGameButton } from '@/components/navigation/FavoriteGameButton';
import { Flex } from '@mantine/core';
import type { GameId } from '@prisma/client';

type GameActionsProps = {
  gameId: GameId;
};

const GameActions = ({ gameId }: GameActionsProps) => {
  // TODO

  // const favoriteGameIds = await gameData.getFavoriteGameIds();
  // const isFavorite = favoriteGameIds.some(
  //   (favoriteGameId) => favoriteGameId === gameId
  // );

  return (
    <Flex justify="flex-end" align="center" w="100%">
      <FavoriteGameButton gameId={gameId} isFavorite={false} />
    </Flex>
  );
};

export { GameActions };
