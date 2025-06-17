import type { GameId } from '@prisma/client';
import { HeaderImage } from '@/app/_navigation/header-image';
import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import { allGameConfigs } from '@/features/game/constants';

type PageLayoutProps = {
  children: React.ReactNode;
  gameId: GameId | undefined;
  heroImage: React.ReactElement<HTMLImageElement> | undefined;
};

const PageLayout = ({ gameId, children, heroImage }: PageLayoutProps) => {
  const gameConfig = allGameConfigs.find((config) => config.id === gameId);

  return (
    <SidebarProvider gameId={gameId}>
      <div className="flex w-full flex-1 items-center justify-center">
        <div className="flex max-w-7xl flex-col items-start justify-center gap-2">
          {heroImage && (
            <div className="flex w-full flex-1 items-center justify-start">
              <div className="w-full">
                <HeaderImage
                  image={heroImage}
                  title={gameConfig?.name}
                  text={gameConfig?.description}
                />
              </div>
            </div>
          )}
          <div className="grid w-full grid-cols-1 sm:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-4">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export { PageLayout };
