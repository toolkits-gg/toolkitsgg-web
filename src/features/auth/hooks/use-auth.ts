import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { UserWithoutPasswordHash } from '@/features/auth/types';
import { getAuth } from '../queries/get-auth';

const useAuth = () => {
  const [user, setUser] = useState<UserWithoutPasswordHash | null>(null);
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
