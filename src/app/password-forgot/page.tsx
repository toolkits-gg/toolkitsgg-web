import { AppSidebar } from '@/app/_navigation/components/app-sidebar';
import { CardCompact } from '@/components/card-compact';
import { SidebarLayout } from '@/components/sidebar-layout';
import { PasswordForgotForm } from '@/features/password/components/password-forgot-form';

const PasswordForgotPage = () => {
  return (
    <SidebarLayout sidebar={<AppSidebar gameConfig={undefined} />}>
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
