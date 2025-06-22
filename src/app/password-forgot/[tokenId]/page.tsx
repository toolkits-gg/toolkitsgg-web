import { PageLayout } from '@/app/_navigation/page-layout';
import { CardCompact } from '@/components/ui/card-compact';
import { PasswordResetForm } from '@/features/password/components/password-reset-form';

type PasswordResetPageProps = {
  params: Promise<{
    tokenId: string;
  }>;
};

const PasswordResetPage = async ({ params }: PasswordResetPageProps) => {
  const { tokenId } = await params;

  return (
    <PageLayout gameId={undefined} heroImage={undefined}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="New Password"
          description="Enter a new password for your account"
          className="motion-safe:animate-fade-from-top w-full max-w-[420px]"
          content={<PasswordResetForm tokenId={tokenId} />}
        />
      </div>
    </PageLayout>
  );
};

export default PasswordResetPage;
