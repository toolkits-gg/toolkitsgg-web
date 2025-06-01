import type { User } from '@prisma/client';
import prisma from '@/lib/prisma';

type UpdateUserArgs = {
  userId: string;
  data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>;
};

export async function updateUser({
  userId,
  data,
}: UpdateUserArgs): Promise<Omit<User, 'passwordHash'>> {
  const userResult = await prisma.user.update({
    where: { id: userId },
    data,
  });

  const { passwordHash: _passwordHash, ...updatedUser } = userResult;

  return updatedUser;
}
