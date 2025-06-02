import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import type { GameId } from '@/features/game/types';

type PageContainerProps = {
  children: React.ReactNode;
  gameId: GameId | undefined;
};

const PageContainer = ({ gameId, children }: PageContainerProps) => {
  return (
    <SidebarProvider gameId={gameId}>
      <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
    </SidebarProvider>
  );
};

export { PageContainer };
