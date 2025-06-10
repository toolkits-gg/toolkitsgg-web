import type { GameId } from '@prisma/client';
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
  gameId: GameId | undefined;
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
        <main className="bg-background flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </main>
      </BaseSidebarInset>
    </BaseSidebarProvider>
  );
};

export { SidebarProvider };
