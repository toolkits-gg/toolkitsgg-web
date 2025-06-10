import Link from 'next/link';
import { PageLayout } from '@/app/_navigation/page-layout';
import { CardCompact } from '@/components/card-compact';
import { SignInForm } from '@/features/auth/components/sign-in-form';
import { passwordForgotPath, signUpPath } from '@/paths';

const SignInPage = () => {
  return (
    <PageLayout gameId={undefined} heroImage={undefined}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Sign In"
          description="Sign in to your account"
          className="motion-safe:animate-fade-from-top w-full max-w-[420px]"
          content={<SignInForm />}
          footer={
            <>
              <Link
                className="text-muted-foreground text-sm"
                href={signUpPath()}
              >
                No account yet?
              </Link>

              <Link
                className="text-muted-foreground text-sm"
                href={passwordForgotPath()}
              >
                Forgot Password?
              </Link>
            </>
          }
        />
      </div>
    </PageLayout>
  );
};

export default SignInPage;
