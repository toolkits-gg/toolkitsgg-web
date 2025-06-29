import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { Heading } from '@/components/heading';
import { Navbar } from '@/components/navbar';
import { SidebarLayout } from '@/components/sidebar-layout';

export default function HomePage() {
  return (
    <SidebarLayout
      sidebar={<AppSidebar gameId={undefined} />}
      navbar={<Navbar>Navigation</Navbar>}
    >
      <Heading>Home Page</Heading>
    </SidebarLayout>
  );
}
