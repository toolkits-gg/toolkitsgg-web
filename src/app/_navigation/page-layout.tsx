import { HeroImage } from '@/app/_navigation/hero-image';
import { SidebarProvider } from '@/app/_navigation/sidebar-provider';
import { allGameConfigs } from '@/features/game/constants';
import type { GameId } from '@/features/game/types';

type PageLayoutProps = {
  children: React.ReactNode;
  gameId: GameId | undefined;
  heroImage: React.ReactElement<HTMLImageElement>;
};

const PageLayout = ({ gameId, children, heroImage }: PageLayoutProps) => {
  const gameConfig = allGameConfigs.find((config) => config.id === gameId);

  return (
    <SidebarProvider gameId={gameId}>
      {heroImage && (
        <HeroImage
          image={heroImage}
          title={gameConfig?.name}
          text={gameConfig?.description}
        />
      )}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 sm:gap-2 md:grid-cols-3 md:gap-4">
        {children}
      </div>
    </SidebarProvider>
  );
};

export { PageLayout };
