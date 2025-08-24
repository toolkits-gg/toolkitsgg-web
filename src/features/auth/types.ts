import type { User, UserProfile } from '@prisma/client';

export type UserWithoutPasswordHash = Omit<User, 'passwordHash'> & {
  passwordHash?: never;
};

export type UserWithProfile =
  | (UserWithoutPasswordHash & { userProfile: UserProfile | null })
  | null;
