'use client';

import type { GameId } from '@prisma/client';
import { LucideHeart, LucideHeartPlus } from 'lucide-react';
import { useActionState } from 'react';
import { Form } from '@/components/form/form';
import { SubmitButton } from '@/components/form/submit-button';
import { EMPTY_ACTION_STATE } from '@/components/form/utils/to-action-state';
import { toggleFavoriteGame } from '@/features/game/actions/toggle-favorite-game';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/tooltip';

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
        <Tooltip>
          <TooltipTrigger>
            <SubmitButton color="accent2" isPending={isPending}>
              <LucideHeart fill="white" className="h-4 w-4" />
            </SubmitButton>
          </TooltipTrigger>
          {!isPending && <TooltipContent>Unfavorite game</TooltipContent>}
        </Tooltip>
      </Form>
    );
  }

  return (
    <Form action={action} actionState={actionState}>
      <Tooltip>
        <TooltipTrigger>
          <SubmitButton isPending={isPending}>
            <LucideHeartPlus className="h-4 w-4" />
          </SubmitButton>
        </TooltipTrigger>
        {!isPending && <TooltipContent>Favorite game</TooltipContent>}
      </Tooltip>
    </Form>
  );
};

export { FavoriteGameButton };
