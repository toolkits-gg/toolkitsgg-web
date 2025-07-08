import { DefaultLogo } from '@/components/logo';
import { Navbar, NavbarSection } from '@/components/navbar';
import { homePath } from '@/paths';
import Link from 'next/link';

const AppNavbar = () => {
  return (
    <Navbar>
      <NavbarSection className="flex max-h-8 w-full items-center justify-end">
        <div className="w-12">
          <Link href={homePath()}>
            <DefaultLogo />
          </Link>
        </div>
      </NavbarSection>
    </Navbar>
  );
};

export { AppNavbar };
