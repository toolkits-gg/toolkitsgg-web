'use server';

import { revalidatePath } from 'next/cache';
import {
  type ActionState,
  fromErrorToActionState,
  toActionState,
} from '@/components/form/utils/to-action-state';
import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';

import { validateItemSlug } from '@/features/collection/utils/validate-item-slug';
import type { GameConfig } from '@/features/game/types';

export const toggleCollectedItem = async (
  gameConfig: GameConfig<unknown>,
  itemSlug: string
): Promise<ActionState> => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  if (!validateItemSlug(gameConfig.id, itemSlug)) {
    throw new Error(`Invalid item slug: ${itemSlug}`);
  }

  if (!gameConfig.gameData) {
    throw new Error('Game data not found for the provided game configuration');
  }

  try {
    const currentlyCollected =
      await gameConfig.gameData.toggleCollectedItem(itemSlug);

    revalidatePath(`/${gameConfig.id}`);

    return toActionState(
      'SUCCESS',
      currentlyCollected
        ? 'Item marked as uncollected'
        : 'Item marked as collected'
    );
  } catch (error) {
    return fromErrorToActionState(error);
  }
};
