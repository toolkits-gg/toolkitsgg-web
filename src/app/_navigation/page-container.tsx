import { SidebarProvider } from '@/app/_navigation/sidebar-provider';

type PageContainerProps = {
  children: React.ReactNode;
  gameId: string | undefined;
};

const PageContainer = ({ gameId, children }: PageContainerProps) => {
  return (
    <SidebarProvider gameId={gameId}>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
    </SidebarProvider>
  );
};

export { PageContainer };
