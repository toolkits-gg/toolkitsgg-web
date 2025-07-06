import { AppSidebar } from '@/app/_navigation/components/app-sidebar';
import { Heading } from '@/components/heading';
import { SidebarLayout } from '@/components/sidebar-layout';

export default function HomePage() {
  return (
    <SidebarLayout sidebar={<AppSidebar gameConfig={undefined} />}>
      <Heading>Home Page</Heading>
    </SidebarLayout>
  );
}
