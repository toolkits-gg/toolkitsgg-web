import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { Header } from '@/app/_navigation/header';
import { UserMenu } from '@/app/_navigation/user-menu';
import {
  SidebarInset as BaseSidebarInset,
  SidebarProvider as BaseSidebarProvider,
} from '@/components/ui/sidebar';

type SidebarProviderProps = {
  children: React.ReactNode;
  gameId?: string;
};

const SidebarProvider = async ({ children, gameId }: SidebarProviderProps) => {
  // TODO fetch user data

  return (
    <BaseSidebarProvider>
      <AppSidebar userMenu={<UserMenu user={undefined} />} gameId={gameId} />
      <BaseSidebarInset>
        <Header />
        {children}
      </BaseSidebarInset>
    </BaseSidebarProvider>
  );
};

export { SidebarProvider };
