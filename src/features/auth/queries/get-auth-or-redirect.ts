import { redirect } from 'next/navigation';
import { cache } from 'react';
import { emailVerificationPath, signInPath } from '@/paths';
import { getAuth } from './get-auth';

type GetAuthOrRedirectOptions = {
  checkEmailVerified?: boolean;
};

export const getAuthOrRedirect = cache(
  async (options?: GetAuthOrRedirectOptions) => {
    const { checkEmailVerified = true } = options ?? {};

    const auth = await getAuth();

    if (!auth.user) {
      redirect(signInPath());
    }

    if (checkEmailVerified && !auth.user.emailVerified) {
      redirect(emailVerificationPath());
    }

    return { ...auth };
  }
);
