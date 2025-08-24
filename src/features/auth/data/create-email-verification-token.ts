import 'server-only';
import prisma from '@/lib/prisma';

type CreateEmailVerificationTokenArgs = {
  userId: string;
  email: string;
  code: string;
  expiresAt: Date;
};
export async function createEmailVerificationToken({
  userId,
  email,
  code,
  expiresAt,
}: CreateEmailVerificationTokenArgs) {
  return await prisma.emailVerificationToken.create({
    data: {
      userId,
      email,
      code,
      expiresAt,
    },
  });
}
