import Link from 'next/link';
import { PageLayout } from '@/app/_navigation/page-layout';
import { CardCompact } from '@/components/card-compact';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { signInPath } from '@/paths';

const SignUpPage = () => {
  return (
    <PageLayout gameId={undefined} headerImage={undefined}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Sign Up"
          description="Create an account to get started"
          className="motion-safe:animate-fade-from-top w-full max-w-[420px]"
          content={<SignUpForm />}
          footer={
            <Link className="text-muted-foreground text-sm" href={signInPath()}>
              Have an account? Sign In now.
            </Link>
          }
        />
      </div>
    </PageLayout>
  );
};

export default SignUpPage;
