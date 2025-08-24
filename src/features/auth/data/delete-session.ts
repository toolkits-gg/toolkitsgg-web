import 'server-only';
import prisma from '@/lib/prisma';

type DeleteSessionArgs = {
  sessionId: string;
};

export const deleteSession = async ({ sessionId }: DeleteSessionArgs) => {
  return await prisma.session.delete({
    where: { id: sessionId },
  });
};
