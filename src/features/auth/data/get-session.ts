import type { Prisma, Session } from '@prisma/client';
import prisma from '@/lib/prisma';

type UserInclude = { user: true };

type Options = {
  includeUser?: boolean;
  omitPasswordHash?: boolean;
};

type SessionPayload<T extends Options> = T extends {
  includeUser: true;
}
  ? Prisma.SessionGetPayload<{ include: UserInclude }>
  : Session;

type GetSessionArgs = {
  sessionId: string;
};

export async function getSession<T extends Options>({
  sessionId,
  options,
}: GetSessionArgs & { options?: T }): Promise<SessionPayload<T>> {
  const includeUser = options?.includeUser && { user: true };

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      ...includeUser,
      user: options?.omitPasswordHash
        ? { select: { id: true, email: true, userProfile: true } }
        : true,
    },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  return session as SessionPayload<T>;
}
