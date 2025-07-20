'use client';

import type { GameId } from '@prisma/client';
import { LucideHeart, LucideHeartPlus } from 'lucide-react';
import { useActionState } from 'react';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
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

  return (
    <Form action={action} actionState={actionState}>
      {isFavorite ? (
        <SubmitButton color="accent2" isPending={isPending}>
          <LucideHeart fill="white" />
        </SubmitButton>
      ) : (
        <SubmitButton isPending={isPending}>
          <LucideHeartPlus />
        </SubmitButton>
      )}
    </Form>
  );
};

export { FavoriteGameButton };
