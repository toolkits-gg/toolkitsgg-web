import type { User } from '@prisma/client';

export type UserWithoutPasswordHash = Omit<User, 'passwordHash'> & {
  passwordHash?: never;
};
