import 'server-only';
import prisma from '@/lib/prisma';

type GetEmailVerificationTokenArgs = {
  userId: string;
};

export async function getEmailVerificationToken({
  userId,
}: GetEmailVerificationTokenArgs) {
  return await prisma.emailVerificationToken.findFirst({
    where: { userId },
  });
}
