import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { CardCompact } from '@/components/card-compact';
import { Navbar } from '@/components/navbar';
import { SidebarLayout } from '@/components/sidebar-layout';
import { PasswordResetForm } from '@/features/password/components/password-reset-form';

type PasswordResetPageProps = {
  params: Promise<{
    tokenId: string;
  }>;
};

const PasswordResetPage = async ({ params }: PasswordResetPageProps) => {
  const { tokenId } = await params;

  return (
    <SidebarLayout
      sidebar={<AppSidebar gameId={undefined} />}
      navbar={<Navbar>Navigation</Navbar>}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="New Password"
          description="Enter a new password for your account"
          className="motion-safe:animate-fade-from-top w-full max-w-[420px]"
          content={<PasswordResetForm tokenId={tokenId} />}
        />
      </div>
    </SidebarLayout>
  );
};

export default PasswordResetPage;
