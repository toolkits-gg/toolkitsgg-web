'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useIsClient } from 'usehooks-ts';
import { Logo } from '@/components/logo';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { homePath } from '@/paths';

const Header = () => {
  const isClient = useIsClient();
  const { theme, setTheme } = useTheme();

  if (!isClient) {
    return null;
  }

  if (!theme) {
    return null;
  }

  const isDarkMode = theme.endsWith('-dark');

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        <div className="flex flex-1 items-center justify-between">
          <SidebarTrigger className="-ml-1" />

          <Link
            href={homePath()}
            onClick={() => setTheme(isDarkMode ? 'default-dark' : 'default')}
          >
            <div className="mt-1 flex h-[48px] w-[48px] flex-1 flex-col items-center justify-center">
              <Logo />
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export { Header };
