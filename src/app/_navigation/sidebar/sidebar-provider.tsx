import { Sidebar } from '@/app/_navigation/sidebar/sidebar';
import { UserMenu } from '@/app/_navigation/sidebar/user-menu';
import {
  SidebarInset as BaseSidebarInset,
  SidebarProvider as BaseSidebarProvider,
} from '@/components/ui/sidebar';

type SidebarProviderProps = {
  children: React.ReactNode;
};

const SidebarProvider = async ({ children }: SidebarProviderProps) => {
  //const { user } = await getAuth();

  return (
    <BaseSidebarProvider>
      <Sidebar
        userMenu={
          <UserMenu
            user={undefined}
            // user={
            //   user
            //     ? {
            //         username: user.username,
            //         email: user.email
            //       }
            //     : undefined
            // }
          />
        }
      />
      <BaseSidebarInset>{children}</BaseSidebarInset>
    </BaseSidebarProvider>
  );
};

export { SidebarProvider };
