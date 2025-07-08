import { AppSidebar } from '@/app/_navigation/components/app-sidebar';
import { CardCompact } from '@/components/card-compact';
import { SidebarLayout } from '@/components/sidebar-layout';
import { EmailVerificationForm } from '@/features/auth/components/email-verification-form';
import { EmailVerificationResendForm } from '@/features/auth/components/email-verification-resend-form';

const EmailVerificationPage = () => {
  return (
    <SidebarLayout sidebar={<AppSidebar gameConfig={undefined} />}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Verify Email"
          description="Please verify your email to continue"
          className="motion-safe:animate-fade-from-top w-full max-w-[420px]"
          content={
            <div className="flex flex-col gap-y-2">
              <EmailVerificationForm />
              <EmailVerificationResendForm />
            </div>
          }
        />
      </div>
    </SidebarLayout>
  );
};

export default EmailVerificationPage;
