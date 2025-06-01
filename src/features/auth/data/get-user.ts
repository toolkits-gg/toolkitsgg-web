import type { Prisma, User } from '@prisma/client';
import prisma from '@/lib/prisma';

type ProfileInclude = { userProfile: true };

type Options = {
  includeUserProfile?: boolean;
  omitPasswordHash?: boolean;
};

type UserPayload<T extends Options> = T extends {
  includeUserProfile: true;
}
  ? Prisma.UserGetPayload<{ include: ProfileInclude }>
  : User;

type GetUserArgs =
  | {
      userId: string;
      userEmail?: never;
    }
  | {
      userId?: never;
      userEmail: string;
    };

export async function getUser<T extends Options>({
  userId,
  userEmail,
  options,
}: GetUserArgs & { options?: T }): Promise<UserPayload<T>> {
  const includeUserProfile = options?.includeUserProfile && {
    userProfile: true,
  };

  if (!userId && !userEmail) {
    throw new Error('Either user id or user email must be provided');
  }

  let user;

  if (userId) {
    user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ...includeUserProfile,
      },
      omit: {
        passwordHash: options ? options.omitPasswordHash : true, // Omit password hash for security
      },
    });
  } else if (userEmail) {
    user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        ...includeUserProfile,
      },
      omit: {
        passwordHash: options ? options.omitPasswordHash : true, // Omit password hash for security
      },
    });
  }

  return user as UserPayload<T>;
}
