import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { Header } from '@/app/_navigation/header';
import { UserMenu } from '@/app/_navigation/user-menu';
import {
  SidebarInset as BaseSidebarInset,
  SidebarProvider as BaseSidebarProvider,
} from '@/components/ui/sidebar';
import type { GameConfigKey } from '@/features/games/types';

type SidebarProviderProps = {
  children: React.ReactNode;
  gameConfigKey?: GameConfigKey;
};

const SidebarProvider = async ({
  children,
  gameConfigKey,
}: SidebarProviderProps) => {
  // TODO fetch user data

  return (
    <BaseSidebarProvider>
      <AppSidebar
        userMenu={<UserMenu user={undefined} />}
        gameConfigKey={gameConfigKey}
      />
      <BaseSidebarInset>
        <Header gameConfigKey={gameConfigKey} />
        {children}
      </BaseSidebarInset>
    </BaseSidebarProvider>
  );
};

export { SidebarProvider };
