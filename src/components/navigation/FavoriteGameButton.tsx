'use client';

import type { GameId } from '@prisma/client';
import { IconHeart, IconHeartPlus } from '@tabler/icons-react';
import { useActionState } from 'react';
import { EMPTY_ACTION_STATE } from '@/components/form/constants';
import { Form } from '@/components/form/Form';
import { SubmitButton } from '@/components/form/SubmitButton';
import { toggleFavoriteGame } from '@/features/game/actions/toggle-favorite-game';

type FavoriteGameButtonProps = {
  gameId: GameId;
  isFavorite: boolean;
};

const FavoriteGameButton = ({
  gameId,
  isFavorite,
}: FavoriteGameButtonProps) => {
  const [actionState, action, isPending] = useActionState(
    toggleFavoriteGame.bind(null, gameId),
    EMPTY_ACTION_STATE
  );

  if (isFavorite) {
    return (
      <Form action={action} actionState={actionState}>
        <SubmitButton
          isPending={isPending}
          tooltip="Unfavorite game"
          aria-label="Unfavorite game"
          color="primary.4"
          variant="filled"
          size="compact-md"
        >
          <IconHeart fill="white" />
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
        variant="outline"
        size="compact-md"
      >
        <IconHeartPlus />
      </SubmitButton>
    </Form>
  );
};

export { FavoriteGameButton };
