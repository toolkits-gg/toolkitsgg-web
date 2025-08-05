'use client';

import type { GameId } from '@prisma/client';
import { useActionState } from 'react';
import { toggleFavoriteGame } from '@/features/game/actions/toggle-favorite-game';
import { IconHeart, IconHeartPlus } from '@tabler/icons-react';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';

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
        >
          <IconHeart fill="white" />
        </SubmitButton>
      </Form>
    );
  }

  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton isPending={isPending} tooltip="Favorite game">
        <IconHeartPlus />
      </SubmitButton>
    </Form>
  );
};

export { FavoriteGameButton };
