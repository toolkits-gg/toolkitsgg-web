import 'server-only';
import prisma from '@/lib/prisma';

type DeleteEmailVerificationTokensArgs =
  | {
      userId?: string;
      id?: never;
    }
  | {
      userId?: never;
      id?: string;
    };

export const deleteEmailVerificationTokens = async ({
  userId,
  id,
}: DeleteEmailVerificationTokensArgs) => {
  await prisma.emailVerificationToken.deleteMany({
    where: { userId, id },
  });
};
