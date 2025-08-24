import 'server-only';
import prisma from '@/lib/prisma';

type CreateUserSessionArgs = {
  id: string;
  userId: string;
  expiresAt: Date;
};

export async function createUserSession({
  id,
  userId,
  expiresAt,
}: CreateUserSessionArgs) {
  return await prisma.session.create({
    data: {
      id,
      userId,
      expiresAt,
    },
  });
}
