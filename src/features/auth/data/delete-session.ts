import 'server-only';
import prisma from '@/lib/prisma';

type DeleteSessionArgs = {
  sessionId: string;
};

export async function deleteSession({ sessionId }: DeleteSessionArgs) {
  return await prisma.session.delete({
    where: { id: sessionId },
  });
}
