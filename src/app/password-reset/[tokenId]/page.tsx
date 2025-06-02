import { PageContainer } from '@/app/_navigation/page-container';
import { CardCompact } from '@/components/card-compact';
import { PasswordResetForm } from '@/features/password/components/password-reset-form';

type PasswordResetPageProps = {
  params: Promise<{
    tokenId: string;
  }>;
};

const PasswordResetPage = async ({ params }: PasswordResetPageProps) => {
  const { tokenId } = await params;

  return (
    <PageContainer gameId={undefined}>
      <div className="flex flex-1 flex-col items-center justify-center">
        <CardCompact
          title="New Password"
          description="Enter a new password for your account"
          className="animate-fade-from-top w-full max-w-[420px]"
          content={<PasswordResetForm tokenId={tokenId} />}
        />
      </div>
    </PageContainer>
  );
};

export default PasswordResetPage;
