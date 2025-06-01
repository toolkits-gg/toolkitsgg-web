import prisma from '@/lib/prisma';

type DeleteUserSessionsArgs = {
  userId: string;
};

export async function deleteUserSessions({ userId }: DeleteUserSessionsArgs) {
  await prisma.session.deleteMany({
    where: { userId },
  });
}
