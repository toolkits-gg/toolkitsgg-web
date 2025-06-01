import Link from 'next/link';
import { PageContainer } from '@/app/_navigation/page-container';
import { CardCompact } from '@/components/card-compact';
import { SignUpForm } from '@/features/auth/components/sign-up-form';
import { signInPath } from '@/paths';

const SignUpPage = () => {
  return (
    <PageContainer gameId={undefined}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="Sign Up"
          description="Create an account to get started"
          className="animate-fade-from-top w-full max-w-[420px]"
          content={<SignUpForm />}
          footer={
            <Link className="text-muted-foreground text-sm" href={signInPath()}>
              Have an account? Sign In now.
            </Link>
          }
        />
      </div>
    </PageContainer>
  );
};

export default SignUpPage;
