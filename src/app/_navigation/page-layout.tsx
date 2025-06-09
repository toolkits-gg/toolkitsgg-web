import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import type { GameId } from '@/features/game/types';

type PageLayoutProps = {
  children: React.ReactNode;
  gameId: GameId | undefined;
  headerImage: React.ReactNode;
};

const PageLayout = ({ gameId, children, headerImage }: PageLayoutProps) => {
  return (
    <SidebarProvider gameId={gameId}>
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-4">
        {headerImage && (
          <div className="col-span-full flex max-h-[300px] w-full flex-1 items-center justify-center overflow-hidden rounded-lg border">
            {headerImage}
          </div>
        )}
        {children}
      </div>
    </SidebarProvider>
  );
};

export { PageLayout };
