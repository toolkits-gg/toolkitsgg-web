'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserWithProfile } from '@/features/auth/types';
import { getAuth } from '../queries/get-auth';

const useAuth = () => {
  const [user, setUser] = useState<UserWithProfile>(null);
  const [isFetched, setFetched] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { user } = await getAuth();
      setUser(user);
      setFetched(true);
    };

    fetchUser();
  }, [pathname]);

  return { user, isFetched };
};

export { useAuth };
