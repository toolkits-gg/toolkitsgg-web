import 'server-only';
import type { Prisma, User } from '@prisma/client';
import { cache } from 'react';
import prisma from '@/lib/prisma';

type ProfileInclude = { userProfile: true };
type FavoriteGamesInclude = { userFavoriteGames: true };

type Options = {
  includeUserProfile?: boolean;
  includeFavoriteGames?: boolean;
  omitPasswordHash?: boolean;
};

type UserPayload<T extends Options> = T extends {
  includeUserProfile: true;
  includeFavoriteGames: true;
}
  ? Prisma.UserGetPayload<{ include: ProfileInclude & FavoriteGamesInclude }>
  : T extends { includeUserProfile: true }
    ? Prisma.UserGetPayload<{ include: ProfileInclude }>
    : T extends { includeFavoriteGames: true }
      ? Prisma.UserGetPayload<{ include: FavoriteGamesInclude }>
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

export const getUser = cache(
  async <T extends Options>({
    userId,
    userEmail,
    options,
  }: GetUserArgs & { options?: T }): Promise<UserPayload<T>> => {
    const includeUserProfile = options?.includeUserProfile && {
      userProfile: true,
    };

    const includeFavoriteGames = options?.includeFavoriteGames && {
      userFavoriteGames: true,
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
          ...includeFavoriteGames,
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
          ...includeFavoriteGames,
        },
        omit: {
          passwordHash: options ? options.omitPasswordHash : true, // Omit password hash for security
        },
      });
    }

    return user as UserPayload<T>;
  }
);
