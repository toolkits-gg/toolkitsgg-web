'use client';

import type { GameId } from '@prisma/client';
import { IconHeart, IconHeartPlus } from '@tabler/icons-react';
import { useActionState, useEffect } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { toggleFavoriteGame } from '@/features/game/actions/toggle-favorite-game';

type FavoriteGameButtonProps = {
  gameId: GameId;
  isFavorite: boolean;
  onChange: (gameId: GameId, isFavorite: boolean) => void;
};

const FavoriteGameButton = ({
  gameId,
  isFavorite,
  onChange,
}: FavoriteGameButtonProps) => {
  const [actionState, action, isPending] = useActionState(
    toggleFavoriteGame.bind(null, gameId),
    EMPTY_ACTION_STATE
  );

  useEffect(() => {
    if (actionState.status === 'SUCCESS') {
      onChange(gameId, !isFavorite);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionState.timestamp]);

  if (isFavorite) {
    return (
      <Form action={action} actionState={actionState}>
        <SubmitButton
          isPending={isPending}
          tooltip="Unfavorite game"
          aria-label="Unfavorite game"
          color="primary.4"
          variant="subtle"
          size="xs"
          style={{ fill: 'var(--mantine-color-primary-4)' }}
        >
          <IconHeart fill="inherit" size={20} />
        </SubmitButton>
      </Form>
    );
  }

  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton
        isPending={isPending}
        tooltip="Favorite game"
        color="primary.4"
        variant="subtle"
        size="xs"
      >
        <IconHeartPlus size={20} />
      </SubmitButton>
    </Form>
  );
};

export { FavoriteGameButton };
