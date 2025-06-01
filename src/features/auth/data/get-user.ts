import type { Prisma, User } from '@prisma/client';
import prisma from '@/lib/prisma';

type ProfileInclude = { userProfile: true };

type Options = {
  includeUserProfile?: boolean;
  omitPasswordHash?: boolean;
};

type UserPayload<T extends Options> = T extends {
  includeUserProfile: true;
  omitPasswordHash: true;
}
  ? Prisma.UserGetPayload<{ include: ProfileInclude }>
  : User;

type GetUserArgs = {
  userId: string;
};

export async function getUser<T extends Options>({
  userId,
  options,
}: GetUserArgs & { options?: T }): Promise<UserPayload<T>> {
  const includeUserProfile = options?.includeUserProfile && {
    userProfile: true,
  };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ...includeUserProfile,
    },
    omit: {
      passwordHash: options ? options.omitPasswordHash : true, // Omit password hash for security
    },
  });

  return user as UserPayload<T>;
}
