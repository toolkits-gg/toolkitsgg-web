import { PageLayout } from '@/app/_navigation/page-layout';
import { CardCompact } from '@/components/card-compact';
import { PasswordForgotForm } from '@/features/password/components/password-forgot-form';

const PasswordForgotPage = () => {
  return (
    <PageLayout gameId={undefined}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Forgot Password"
          description="Enter your email address to reset your password."
          className="animate-fade-from-top w-full max-w-[420px]"
          content={<PasswordForgotForm />}
        />
      </div>
    </PageLayout>
  );
};

export default PasswordForgotPage;
