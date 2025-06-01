import { PageContainer } from '@/app/_navigation/page-container';
import { CardCompact } from '@/components/card-compact';
import { EmailVerificationForm } from '@/features/auth/components/email-verification-form';
import { EmailVerificationResendForm } from '@/features/auth/components/email-verification-resend-form';

const EmailVerificationPage = () => {
  return (
    <PageContainer gameId={undefined}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Verify Email"
          description="Please verify your email to continue"
          className="animate-fade-from-top w-full max-w-[420px]"
          content={
            <div className="flex flex-col gap-y-2">
              <EmailVerificationForm />
              <EmailVerificationResendForm />
            </div>
          }
        />
      </div>
    </PageContainer>
  );
};

export default EmailVerificationPage;
