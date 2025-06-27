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
  const [actionState, action] = useActionState(
    toggleFavoriteGame.bind(null, gameId),
    EMPTY_ACTION_STATE
  );

  return (
    <Form action={action} actionState={actionState}>
      <SubmitButton
        icon={
          isFavorite ? (
            <LucideHeart className="h-4 w-4" />
          ) : (
            <LucideHeartPlus className="h-4 w-4" />
          )
        }
      />
    </Form>
  );
};

export { FavoriteGameButton };
