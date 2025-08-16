import { FavoriteGameButton } from '@/components/navigation/FavoriteGameButton';
import { Group } from '@mantine/core';
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
    <Group>
      <FavoriteGameButton gameId={gameId} isFavorite={false} />
    </Group>
  );
};

export { GameActions };
