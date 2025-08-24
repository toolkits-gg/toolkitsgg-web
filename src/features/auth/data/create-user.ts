import 'server-only';
import prisma from '@/lib/prisma';

type CreateUserArgs = {
  username: string;
  email: string;
  passwordHash: string;
};

export const createUser = async ({
  username,
  email,
  passwordHash,
}: CreateUserArgs) => {
  return await prisma.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  });
};
