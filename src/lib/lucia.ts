import { authData } from '@/features/auth/data';
import { hashToken } from '@/utils/crypto';

const SESSION_REFRESH_INTERVAL_MS = 1000 * 60 * 60 * 24 * 15; // 15 days
const SESSION_MAX_DURATION_MS = SESSION_REFRESH_INTERVAL_MS * 2; // 30 days

export const createSession = async (sessionToken: string, userId: string) => {
  const sessionId = hashToken(sessionToken);

  const session = {
    id: sessionId,
    userId,
    expiresAt: new Date(Date.now() + SESSION_MAX_DURATION_MS),
  };

  await authData.createUserSession(session);

  return session;
};

export const validateSession = async (sessionToken: string) => {
  const sessionId = hashToken(sessionToken);

  const result = await authData.getSession({
    sessionId,
    options: {
      includeUser: true,
    },
  });

  if (!result) {
    return { session: null, user: null };
  }

  const { user, ...session } = result;

  // if the session is expired, delete it
  if (Date.now() >= session.expiresAt.getTime()) {
    await authData.deleteSession({ sessionId });

    return { session: null, user: null };
  }

  // if 15 days are left until the session expires, refresh the session
  if (Date.now() >= session.expiresAt.getTime() - SESSION_REFRESH_INTERVAL_MS) {
    session.expiresAt = new Date(Date.now() + SESSION_MAX_DURATION_MS);

    await authData.updateSession({
      sessionId,
      data: {
        expiresAt: session.expiresAt,
      },
    });
  }

  return {
    session,
    user: {
      ...user,
      passwordHash: undefined, // Omit password hash for security
    },
  };
};

export const invalidateSession = async (sessionId: string) => {
  await authData.deleteSession({ sessionId });
};
