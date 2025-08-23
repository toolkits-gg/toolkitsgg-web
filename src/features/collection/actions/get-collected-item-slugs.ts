'use server';

import { formUtils } from '@/components/form/utils';
import { getAuth } from '@/features/auth/queries/get-auth';
import type { GameConfig } from '@/features/game/types';

export const getCollectedItemSlugs = async (
  gameConfig: GameConfig<unknown>
): Promise<string[]> => {
  const { user } = await getAuth();
  if (!user) {
    return [];
  }

  if (!gameConfig.dataUtils) {
    throw new Error(
      'Game data utility functions not found for the provided game configuration'
    );
  }

  try {
    return await gameConfig.dataUtils.getCollectedItemSlugs();
  } catch (error) {
    formUtils.fromErrorToActionState({ error });
    return [];
  }
};
