'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useIsClient } from 'usehooks-ts';
import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { homePath } from '@/paths';

type HeaderProps = {
  gameId?: string;
};

const Header = ({ gameId }: HeaderProps) => {
  const isClient = useIsClient();
  const { theme, setTheme } = useTheme();

  if (!isClient) {
    return <div className="h-14 w-full" />;
  }

  const isDarkMode = theme?.endsWith('-dark');

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-2 px-4">
        <div className="flex flex-1 items-center justify-between">
          <SidebarTrigger className="-ml-1" />

          <Link
            href={homePath()}
            onClick={() => setTheme(isDarkMode ? 'default-dark' : 'default')}
          >
            <div className="flex h-[56px] w-[56px] items-center justify-center">
              <Logo gameId={gameId} size={64} />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export { Header };
