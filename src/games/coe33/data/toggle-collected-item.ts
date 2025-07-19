import { getAuthOrRedirect } from '@/features/auth/queries/get-auth-or-redirect';
import type { GameData } from '@/features/game/types';
import prisma from '@/lib/prisma';

export const toggleCollectedItem = async (
  itemSlug: string
): ReturnType<GameData['toggleCollectedItem']> => {
  const { user } = await getAuthOrRedirect();
  if (!user) {
    throw new Error('User not authenticated');
  }

  const itemResult = await prisma.cOE33CollectedItem.findFirst({
    where: {
      coe33Item: {
        slug: itemSlug,
      },
    },
    select: {
      id: true,
      coe33Item: {
        select: {
          slug: true,
        },
      },
    },
  });

  const itemCurrentlyCollected = !!itemResult;

  if (itemCurrentlyCollected) {
    const currentItemId = itemResult?.id;

    await prisma.cOE33CollectedItem.delete({
      where: {
        id: currentItemId,
      },
    });

    return {
      isCollected: false,
    };
  }

  const item = await prisma.cOE33Item.findFirst({
    where: {
      slug: itemSlug,
    },
  });

  if (!item) {
    throw new Error(`Item not found with slug provided: ${itemSlug}`);
  }

  await prisma.cOE33CollectedItem.create({
    data: {
      userId: user.id,
      coe33ItemId: item.id,
    },
  });

  return {
    isCollected: true,
  };
};
