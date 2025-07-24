'use server';

import { revalidatePath } from 'next/cache';
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';

import { validateItemSlug } from '@/features/collection/utils/validate-item-slug';
import type { GameId } from '@prisma/client';
import { toGameConfig } from '@/features/game/utils/game-id';

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

  const gameConfig = toGameConfig(gameId);

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

    return toActionState(
      'SUCCESS',
      isCollected ? 'Item marked as collected' : 'Item marked as uncollected'
    );
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
