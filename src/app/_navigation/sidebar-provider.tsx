import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { Header } from '@/app/_navigation/header';
import { UserMenu } from '@/app/_navigation/user-menu';
import {
  SidebarInset as BaseSidebarInset,
  SidebarProvider as BaseSidebarProvider,
} from '@/components/ui/sidebar';
import { getAuth } from '@/features/auth/queries/get-auth';

type SidebarProviderProps = {
  children: React.ReactNode;
  gameId?: string;
};

const SidebarProvider = async ({ children, gameId }: SidebarProviderProps) => {
  const auth = await getAuth();

  return (
    <BaseSidebarProvider>
      <AppSidebar
        userMenu={<UserMenu user={auth.user ?? undefined} />}
        gameId={gameId}
      />
      <BaseSidebarInset>
        <Header gameId={gameId} />
        {children}
      </BaseSidebarInset>
    </BaseSidebarProvider>
  );
};

export { SidebarProvider };
