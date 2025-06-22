import { Sidebar } from '@/app/_navigation/sidebar';
import { Navbar } from '@/components/navbar';
import { SidebarLayout } from '@/components/sidebar-layout';
import { ThemeSwitcher } from '@/features/theme/components/theme-switcher';

export default function HomePage() {
  return (
    <SidebarLayout
      sidebar={<Sidebar gameId={'coe33'} />}
      navbar={<Navbar>Navigation</Navbar>}
    >
      <ThemeSwitcher />
    </SidebarLayout>
  );
}
