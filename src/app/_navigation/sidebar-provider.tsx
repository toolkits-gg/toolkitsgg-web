import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { UserMenu } from '@/app/_navigation/user-menu';
import {
  SidebarInset as BaseSidebarInset,
  SidebarProvider as BaseSidebarProvider,
} from '@/components/ui/sidebar';

type SidebarProviderProps = {
  children: React.ReactNode;
};

const SidebarProvider = async ({ children }: SidebarProviderProps) => {
  // TODO fetch user data

  return (
    <BaseSidebarProvider>
      <AppSidebar userMenu={<UserMenu user={undefined} />} />
      <BaseSidebarInset>{children}</BaseSidebarInset>
    </BaseSidebarProvider>
  );
};

export { SidebarProvider };
