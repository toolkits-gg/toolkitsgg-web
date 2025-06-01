import prisma from '@/lib/prisma';

type DeleteUserArgs = {
  userId: string;
};

export async function deleteUser({ userId }: DeleteUserArgs) {
  await prisma.user.delete({
    where: { id: userId },
  });
}
