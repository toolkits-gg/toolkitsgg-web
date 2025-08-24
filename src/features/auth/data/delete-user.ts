import 'server-only';
import prisma from '@/lib/prisma';

type DeleteUserArgs = {
  userId: string;
};

export const deleteUser = async ({ userId }: DeleteUserArgs) => {
  await prisma.user.delete({
    where: { id: userId },
  });
};
