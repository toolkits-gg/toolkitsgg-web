'use client';

import Link from 'next/link';
import { useIsClient } from 'usehooks-ts';
import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { GameId } from '@/features/game/types';
import { homePath } from '@/paths';

type HeaderProps = {
  gameId: GameId | undefined;
};

const Header = ({ gameId: _gameId }: HeaderProps) => {
  const isClient = useIsClient();

  if (!isClient) {
    return <div className="h-14 w-full" />;
  }

  return (
    <header className="bg-background flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-2 px-4">
        <div className="flex flex-1 items-center justify-between">
          <SidebarTrigger className="-ml-1" />

          <Link href={homePath()}>
            <div className="flex h-[56px] w-[56px] items-center justify-center">
              <Logo gameId="none" size={64} />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export { Header };
