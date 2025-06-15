import type { GameId } from '@prisma/client';
import { HeroImage } from '@/app/_navigation/hero-image';
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
      {heroImage && (
        <div className="flex w-full flex-1 items-center justify-center">
          <div className="w-full max-w-4xl">
            <HeroImage
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
    </SidebarProvider>
  );
};

export { PageLayout };
