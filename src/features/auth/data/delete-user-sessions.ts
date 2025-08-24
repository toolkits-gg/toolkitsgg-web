import 'server-only';
import prisma from '@/lib/prisma';

type DeleteUserSessionsArgs = {
  userId: string;
};

export const deleteUserSessions = async ({
  userId,
}: DeleteUserSessionsArgs) => {
  await prisma.session.deleteMany({
    where: { userId },
  });
};
