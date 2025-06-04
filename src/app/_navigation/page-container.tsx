import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import type { GameId } from '@/features/game/types';

type PageContainerProps = {
  children: React.ReactNode;
  gameId: GameId | undefined;
};

const PageContainer = ({ gameId, children }: PageContainerProps) => {
  return <SidebarProvider gameId={gameId}>{children}</SidebarProvider>;
};

export { PageContainer };
