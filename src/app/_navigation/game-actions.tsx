import type { GameId } from '@prisma/client';
import { FavoriteGameButton } from '@/app/_navigation/favorite-game-button';
import { gameData } from '@/features/game/data';

type GameActionsProps = {
  gameId: GameId;
};

const GameActions = async ({ gameId }: GameActionsProps) => {
  const favoriteGameIds = await gameData.getFavoriteGameIds();
  const isFavorite = favoriteGameIds.some(
    (favoriteGameId) => favoriteGameId === gameId
  );

  return (
    <div className="ml-1 flex w-full flex-1 items-center justify-start gap-1">
      <FavoriteGameButton gameId={gameId} isFavorite={isFavorite} />
    </div>
  );
};

export { GameActions };
