import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import type { GameId } from '@/features/game/types';

type PageLayoutProps = {
  children: React.ReactNode;
  gameId: GameId | undefined;
};

const PageLayout = ({ gameId, children }: PageLayoutProps) => {
  return <SidebarProvider gameId={gameId}>{children}</SidebarProvider>;
};

export { PageLayout };
