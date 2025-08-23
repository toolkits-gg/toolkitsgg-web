'use server';

import type { GameId } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import type { ActionState } from '@/components/form/types';
import { formUtils } from '@/components/form/utils';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import { validateItemSlug } from '@/features/collection/utils/validate-item-slug';
import { gameUtils } from '@/features/game/utils';

export const toggleCollectedItem = async (
  gameId: GameId,
  itemSlug: string
): Promise<ActionState> => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!validateItemSlug(gameId, itemSlug)) {
    throw new Error(`Invalid item slug: ${itemSlug}`);
  }

  const gameConfig = gameUtils.toGameConfig(gameId);

  if (!gameConfig) {
    throw new Error(`Game configuration not found for gameId: ${gameId}`);
  }

  if (!gameConfig.dataUtils) {
    throw new Error(
      `Data helpers not found for game configuration: ${gameConfig.id}`
    );
  }

  try {
    const { isCollected } =
      await gameConfig.dataUtils.toggleCollectedItem(itemSlug);

    revalidatePath(`/${gameConfig.id}`);

    return formUtils.toActionState({
      status: 'SUCCESS',
      message: isCollected
        ? 'Item marked as collected'
        : 'Item marked as uncollected',
      showToast: false,
    });
  } catch (error) {
    return formUtils.fromErrorToActionState({ error });
  }
};
