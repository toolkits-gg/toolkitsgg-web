import 'server-only';
import prisma from '@/lib/prisma';

type UpdateSessionArgs = {
  sessionId: string;
  data: Partial<{
    userId: string;
    expiresAt: Date;
  }>;
};

export async function updateSession({ sessionId, data }: UpdateSessionArgs) {
  return await prisma.session.update({
    where: { id: sessionId },
    data,
  });
}
