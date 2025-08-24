'use client';

import { Button, Flex, Loader } from '@mantine/core';
import type { GameId } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { FavoriteGameButton } from '@/components/navigation/FavoriteGameButton';
import type { UserWithProfile } from '@/features/auth/types';
import { getFavoriteGameIds } from '@/features/game/actions/get-favorite-game-ids';

type GameActionsProps = {
  gameId: GameId;
  user: UserWithProfile;
};

const GameActions = ({ gameId, user }: GameActionsProps) => {
  const [favoriteGameIds, setFavoriteGameIds] = useState<GameId[]>([]);
  const gameIdsInitialized = useRef(false);

  useEffect(() => {
    if (!user) {
      return;
    }
    async function getData() {
      const favoriteGameIds = await getFavoriteGameIds();
      setFavoriteGameIds(favoriteGameIds);
      gameIdsInitialized.current = true;
    }
    getData();
  }, [user]);

  const isFavorite = favoriteGameIds.some(
    (favoriteGameId) => favoriteGameId === gameId
  );

  const handleFavoriteChange = (gameId: GameId, isFavorite: boolean) => {
    setFavoriteGameIds((prevFavoriteGameIds) => {
      if (isFavorite) {
        return [...prevFavoriteGameIds, gameId];
      }
      return prevFavoriteGameIds.filter((id) => id !== gameId);
    });
  };

  if (!gameIdsInitialized.current) {
    return (
      <Flex justify="flex-end" align="center" w="100%">
        <Button variant="outline" disabled size="sm">
          <Loader size={20} />
        </Button>
      </Flex>
    );
  }
  return (
    <Flex justify="flex-end" align="center" w="100%">
      <FavoriteGameButton
        gameId={gameId}
        isFavorite={isFavorite}
        onChange={handleFavoriteChange}
      />
    </Flex>
  );
};

export { GameActions };
