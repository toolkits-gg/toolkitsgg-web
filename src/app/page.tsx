import { PageLayout } from '@/components/PageLayout';
import { getAuth } from '@/features/auth/queries/get-auth';

export default async function HomePage() {
  const session = await getAuth();
  const user = session?.user;

  return (
    <PageLayout user={user} gameId={undefined}>
      Home Page
    </PageLayout>
  );
}
