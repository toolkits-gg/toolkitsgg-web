import { AppSidebar } from '@/app/_navigation/app-sidebar';
import { CardCompact } from '@/components/card-compact';
import { Navbar } from '@/components/navbar';
import { SidebarLayout } from '@/components/sidebar-layout';
import { PasswordForgotForm } from '@/features/password/components/password-forgot-form';

const PasswordForgotPage = () => {
  return (
    <SidebarLayout
      sidebar={<AppSidebar gameId={undefined} />}
      navbar={<Navbar>Navigation</Navbar>}
    >
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Forgot Password"
          description="Enter your email address to reset your password."
          className="motion-safe:animate-fade-from-top w-full max-w-[420px]"
          content={<PasswordForgotForm />}
        />
      </div>
    </SidebarLayout>
  );
};

export default PasswordForgotPage;
